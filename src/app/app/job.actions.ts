'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClientForServerAction } from '@/lib/supabase';
import { callTailoredCv } from '@/lib/ai';
import { enforceCvGenerationRateLimit, enforceMonthlyQuota, getUserLimits } from '@/lib/rate-limit';

export type JobActionState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  errors?: Record<string, string>;
};

const jobSchema = z.object({
  title: z.string().max(150).optional(),
  company: z.string().max(150).optional(),
  text: z.string().min(80, 'Job description must be at least 80 characters.').max(8000),
});

const normalize = (value: FormDataEntryValue | null) => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

export async function addJobDescription(
  _prev: JobActionState,
  formData: FormData,
): Promise<JobActionState> {
  const supabase = createClientForServerAction();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { status: 'error', message: 'You must be signed in.' };
  }

  const parsed = jobSchema.safeParse({
    title: normalize(formData.get('title')),
    company: normalize(formData.get('company')),
    text: normalize(formData.get('text')),
  });

  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const errors: Record<string, string> = {};
    if (flat.formErrors.length) {
      errors.text = flat.formErrors.join(' ');
    }
    for (const [field, msgs] of Object.entries(flat.fieldErrors)) {
      if (msgs?.length) {
        errors[field] = msgs[0];
      }
    }
    return {
      status: 'error',
      message: 'Please fix the highlighted fields.',
      errors,
    };
  }

  const { count } = await supabase
    .from('job_descriptions')
    .select('id', { head: true, count: 'exact' })
    .eq('user_id', session.user.id);

  if (count && count >= 20) {
    return {
      status: 'error',
      message: 'Maximum of 20 job descriptions stored. Remove one to add another.',
    };
  }

  const now = new Date().toISOString();
  const { error } = await supabase.from('job_descriptions').insert({
    user_id: session.user.id,
    title: parsed.data.title ?? null,
    company: parsed.data.company ?? null,
    text_content: parsed.data.text,
    created_at: now,
  });

  if (error) {
    return {
      status: 'error',
      message: 'Could not save the job description. Please try again.',
    };
  }

  revalidatePath('/app');
  return { status: 'success', message: 'Job description added.' };
}

export async function deleteJobDescription(id: string) {
  const supabase = createClientForServerAction();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return;

  await supabase
    .from('job_descriptions')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id);

  revalidatePath('/app');
}

const generateSchema = z.object({
  job_ids: z.array(z.string().uuid()).min(1, 'Select at least one job description.').max(5),
  embellishment_level: z.coerce.number().int().min(1).max(5).default(3),
});

export type GenerateState = {
  status: 'idle' | 'running' | 'success' | 'partial' | 'error';
  message?: string;
};

export async function generateTailoredCvs(
  _prev: GenerateState,
  formData: FormData,
): Promise<GenerateState> {
  const supabase = createClientForServerAction();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return {
      status: 'error',
      message: 'You must be signed in to generate tailored CVs.',
    };
  }

  const parsed = generateSchema.safeParse({
    job_ids: formData.getAll('job_ids').filter((id): id is string => typeof id === 'string'),
    embellishment_level: formData.get('embellishment_level') ?? undefined,
  });

  if (!parsed.success) {
    return {
      status: 'error',
      message: parsed.error.errors[0]?.message ?? 'Invalid generation request.',
    };
  }

  const jobIds = parsed.data.job_ids;
  const embellishment = parsed.data.embellishment_level;

  const limits = await getUserLimits(supabase, session.user.id);

  const rateLimitCheck = await enforceCvGenerationRateLimit(session.user.id, supabase, limits);
  if (!rateLimitCheck.ok) {
    return { status: 'error', message: rateLimitCheck.message };
  }

  const quotaCheck = await enforceMonthlyQuota({
    supabase,
    userId: session.user.id,
    runType: 'cv_generation',
    limit: limits.generation.monthlyLimit,
    limit: MONTHLY_GENERATION_LIMIT,
    pending: jobIds.length,
    label: 'tailored CV generations',
  });
  if (!quotaCheck.ok) {
    return { status: 'error', message: quotaCheck.message };
  }

  const { data: referenceCv, error: refError } = await supabase
    .from('cvs')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('is_reference', true)
    .maybeSingle();

  if (refError || !referenceCv) {
    return {
      status: 'error',
      message: 'Set a reference CV before generating tailored versions.',
    };
  }

  const { data: latestOptimized } = await supabase
    .from('optimized_cvs')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('cv_id', referenceCv.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const baseCvText = latestOptimized?.optimized_text ?? referenceCv.text_content;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .maybeSingle();

  const { data: jobs, error: jobsError } = await supabase
    .from('job_descriptions')
    .select('*')
    .in('id', jobIds)
    .eq('user_id', session.user.id);

  if (jobsError || !jobs || !jobs.length) {
    return {
      status: 'error',
      message: 'Selected job descriptions could not be found.',
    };
  }

  let successCount = 0;
  let failureCount = 0;

  for (const job of jobs) {
    try {
      const { result, usage } = await callTailoredCv({
        model: 'gpt-4o-mini',
        referenceCv: baseCvText,
        jobDescription: {
          title: job.title,
          company: job.company,
          text_content: job.text_content,
        },
        profile: {
          full_name: profile?.full_name ?? null,
          job_title: profile?.job_title ?? null,
          professional_summary: profile?.professional_summary ?? null,
          industry: null,
        },
        embellishmentLevel: embellishment,
      });

      if (!result.sections.length) {
        throw new Error('AI did not return section data for review.');
      }

      const now = new Date().toISOString();

      const { data: generatedCv, error: insertError } = await supabase
        .from('generated_cvs')
        .insert({
          user_id: session.user.id,
          cv_id: referenceCv.id,
          jd_id: job.id,
          tailored_text: result.tailored_cv,
          optimization_notes: result.optimization_notes ?? null,
          match_score: result.match_analysis?.overall_match_score ?? null,
          status: 'in_review',
          created_at: now,
          updated_at: now,
        })
        .select('*')
        .single();

      if (insertError || !generatedCv) {
        throw new Error(insertError?.message ?? 'Unable to store tailored CV.');
      }

      const sectionPayload = result.sections.map((section, index) => ({
        user_id: session.user.id,
        generated_cv_id: generatedCv.id,
        section_name: section.name,
        original_text: section.reference_section,
        suggested_text: section.tailored_section,
        final_text: null,
        rationale: section.rationale ?? null,
        status: 'pending',
        ordering: index,
        created_at: now,
        updated_at: now,
      }));

      const { error: sectionError } = await supabase
        .from('generated_cv_sections')
        .insert(sectionPayload);

      if (sectionError) {
        throw new Error(sectionError.message);
      }

      await supabase.from('ai_runs').insert({
        user_id: session.user.id,
        run_type: 'cv_generation',
        provider: 'openai',
        model: 'gpt-4o-mini',
        tokens_input: usage?.prompt_tokens ?? null,
        tokens_output: usage?.completion_tokens ?? null,
        status: 'success',
        metadata: {
          jd_id: job.id,
          match_analysis: result.match_analysis,
          sections_count: result.sections.length,
        },
        created_at: now,
      });

      successCount += 1;
    } catch (err) {
      failureCount += 1;
      await supabase.from('ai_runs').insert({
        user_id: session.user.id,
        run_type: 'cv_generation',
        provider: 'openai',
        model: 'gpt-4o-mini',
        status: 'failed',
        metadata: {
          jd_id: job.id,
          error: err instanceof Error ? err.message : 'Unknown error',
        },
        created_at: new Date().toISOString(),
      });
    }
  }

  revalidatePath('/app');

  if (successCount === 0) {
    return {
      status: 'error',
      message: 'Generation failed for the selected jobs.',
    };
  }

  if (failureCount > 0) {
    return {
      status: 'partial',
      message: `Generated ${successCount} CV(s), ${failureCount} failed.`,
    };
  }

  return {
    status: 'success',
    message: `Generated ${successCount} tailored CV(s).`,
  };
}

