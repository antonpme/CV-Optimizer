'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClientForServerAction } from '@/lib/supabase';
import { enforceCvOptimizationRateLimit, enforceMonthlyQuota, getUserLimits } from '@/lib/rate-limit';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = new Set([
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

export type UploadCvState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  errors?: Record<string, string>;
};

export type OptimizeCvState = {
  status: 'idle' | 'running' | 'success' | 'error';
  message?: string;
};

const uploadSchema = z.object({
  title: z.string().max(120).optional(),
  pasted_text: z.string().trim().optional(),
});

const normalizeTitle = (value: string | undefined, fallback: string) => {
  if (!value) return fallback;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : fallback;
};

export async function uploadCv(
  _prevState: UploadCvState,
  formData: FormData,
): Promise<UploadCvState> {
  const supabase = createClientForServerAction();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { status: 'error', message: 'You must be signed in to upload a CV.' };
  }

  const parsedForm = uploadSchema.safeParse({
    title: (formData.get('title') as string) ?? undefined,
    pasted_text: (formData.get('pasted_text') as string) ?? undefined,
  });

  if (!parsedForm.success) {
    const flat = parsedForm.error.flatten();
    const errors: Record<string, string> = {};
    for (const [field, messages] of Object.entries(flat.fieldErrors)) {
      if (!messages?.length) continue;
      errors[field] = messages[0];
    }

    return {
      status: 'error',
      message: 'Please review the form and fix any issues.',
      errors,
    };
  }

  const { title: titleInput, pasted_text: pastedText } = parsedForm.data;
  const file = formData.get('file');

  if (!(file instanceof File) && (!pastedText || !pastedText.trim())) {
    return {
      status: 'error',
      message: 'Upload a DOCX/TXT file or paste your CV text.',
      errors: { file: 'Add a file or paste your CV text.' },
    };
  }

  let textContent = '';
  let storagePath: string | null = null;
  let originalFilename: string | null = null;

  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_FILE_SIZE) {
      return {
        status: 'error',
        message: 'Files must be 5MB or smaller.',
        errors: { file: 'Files must be 5MB or smaller.' },
      };
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return {
        status: 'error',
        message: 'Only DOCX or TXT files are supported.',
        errors: { file: 'Only DOCX or TXT files are supported.' },
      };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (file.type === 'text/plain') {
      textContent = buffer.toString('utf8');
    } else {
      type MammothExtract = (input: { buffer: Buffer }) => Promise<{ value: string }>;
      const mammothModule = (await import('mammoth')) as {
        default?: { extractRawText: MammothExtract };
        extractRawText: MammothExtract;
      };
      const mammoth = mammothModule.default ?? mammothModule;
      const { value } = await mammoth.extractRawText({ buffer });
      textContent = value;
    }

    originalFilename = file.name;
    const extension = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : 'docx';
    const storageKey = `${session.user.id}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from('cv-uploads')
      .upload(storageKey, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });

    if (uploadError) {
      return {
        status: 'error',
        message: 'Could not store the file. Please try again.',
      };
    }

    storagePath = storageKey;
  }

  if (!textContent && pastedText) {
    textContent = pastedText;
  }

  textContent = textContent.trim();

  if (!textContent.length) {
    return {
      status: 'error',
      message: 'We could not extract any text from your CV. Paste the content manually and try again.',
      errors: { file: 'CV text was empty.', pasted_text: 'Paste your CV text if extraction fails.' },
    };
  }

  const { count: referenceCount } = await supabase
    .from('cvs')
    .select('id', { head: true, count: 'exact' })
    .eq('user_id', session.user.id)
    .eq('is_reference', true);

  const inferredTitle = originalFilename
    ? originalFilename.replace(/\.[^.]+$/, '')
    : 'Pasted CV';
  const title = normalizeTitle(titleInput, inferredTitle);

  const { error: insertError } = await supabase.from('cvs').insert({
    user_id: session.user.id,
    title,
    original_filename: originalFilename,
    docx_path: storagePath,
    text_content: textContent,
    is_reference: !referenceCount,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (insertError) {
    return {
      status: 'error',
      message: 'Could not save the CV. Please try again.',
    };
  }

  revalidatePath('/app');
  return {
    status: 'success',
    message: 'CV uploaded successfully.',
  };
}

export async function setReferenceCv(cvId: string) {
  const supabase = createClientForServerAction();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return;
  }

  const userId = session.user.id;

  await supabase
    .from('cvs')
    .update({ is_reference: false, updated_at: new Date().toISOString() })
    .eq('user_id', userId);

  await supabase
    .from('cvs')
    .update({ is_reference: true, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('id', cvId);

  revalidatePath('/app');
}

const optimizeFormSchema = z.object({
  cv_id: z.string().uuid(),
  embellishment_level: z.coerce.number().int().min(1).max(5),
});

import { callCvOptimization } from '@/lib/ai';

export async function optimizeReferenceCv(
  prevState: OptimizeCvState,
  formData: FormData,
): Promise<OptimizeCvState> {
  const supabase = createClientForServerAction();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { status: 'error', message: 'You must be signed in.' };
  }

  const parsed = optimizeFormSchema.safeParse({
    cv_id: formData.get('cv_id'),
    embellishment_level: formData.get('embellishment_level'),
  });

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Invalid request. Please try again.',
    };
  }

  const { cv_id: cvId, embellishment_level: embellishment } = parsed.data;

  const limits = await getUserLimits(supabase, session.user.id);

  const rateLimitCheck = await enforceCvOptimizationRateLimit(session.user.id, supabase, limits);
  if (!rateLimitCheck.ok) {
    return { status: 'error', message: rateLimitCheck.message };
  }

  const quotaCheck = await enforceMonthlyQuota({
    supabase,
    userId: session.user.id,
    runType: 'optimize_cv',
    limit: limits.optimization.monthlyLimit,
    pending: 1,
    label: 'reference optimizations',
  });
  if (!quotaCheck.ok) {
    return { status: 'error', message: quotaCheck.message };
  }

  const { data: cv, error: cvError } = await supabase
    .from('cvs')
    .select('*')
    .eq('id', cvId)
    .eq('user_id', session.user.id)
    .single();

  if (cvError || !cv) {
    return {
      status: 'error',
      message: 'CV not found.',
    };
  }

  if (!cv.is_reference) {
    return {
      status: 'error',
      message: 'Only the reference CV can be optimised.',
    };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  try {
    const { result, usage } = await callCvOptimization({
      model: 'gpt-4o-mini',
      cvText: cv.text_content,
      profile: {
        full_name: profile?.full_name ?? undefined,
        job_title: profile?.job_title ?? undefined,
        professional_summary: profile?.professional_summary ?? undefined,
        industry: profile?.industry ?? undefined,
        embellishment_level: profile?.embellishment_level ?? undefined,
      },
      embellishmentLevel: embellishment,
    });

    const now = new Date().toISOString();

    const { error: insertOptimized } = await supabase.from('optimized_cvs').insert({
      user_id: session.user.id,
      cv_id: cv.id,
      optimized_text: result.optimized_cv,
      optimization_summary: {
        changes_summary: result.changes_summary,
        recommendations: result.recommendations,
        overall_confidence: result.overall_confidence,
      },
      ai_model_used: 'gpt-4o-mini',
      confidence_score: result.overall_confidence ?? null,
      created_at: now,
      updated_at: now,
    });

    if (insertOptimized) {
      throw new Error(insertOptimized.message);
    }

    await supabase
      .from('cvs')
      .update({ updated_at: now })
      .eq('id', cv.id)
      .eq('user_id', session.user.id);

    await supabase.from('ai_runs').insert({
      user_id: session.user.id,
      run_type: 'optimize_cv',
      provider: 'openai',
      model: 'gpt-4o-mini',
      tokens_input: usage?.prompt_tokens ?? null,
      tokens_output: usage?.completion_tokens ?? null,
      status: 'success',
      metadata: {
        cv_id: cv.id,
        embellishment_level: embellishment,
      },
      created_at: now,
    });

    revalidatePath('/app');
    return {
      status: 'success',
      message: 'Reference CV optimised.',
    };
  } catch (error: unknown) {
    await supabase.from('ai_runs').insert({
      user_id: session.user.id,
      run_type: 'optimize_cv',
      provider: 'openai',
      model: 'gpt-4o-mini',
      status: 'failed',
      metadata: {
        cv_id: cv.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      created_at: new Date().toISOString(),
    });

    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Optimisation failed.',
    };
  }
}


