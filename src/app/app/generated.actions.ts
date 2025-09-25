'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClientForServerAction } from '@/lib/supabase';

export type SectionReviewState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

const reviewSchema = z.object({
  section_id: z.string().uuid(),
  action: z.enum(['approve', 'reject']),
  final_text: z
    .string()
    .max(16000, 'Section is too long for export. Please condense the text.')
    .optional(),
});

export async function reviewGeneratedSection(
  _prev: SectionReviewState,
  formData: FormData,
): Promise<SectionReviewState> {
  const supabase = createClientForServerAction();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { status: 'error', message: 'You must be signed in.' };
  }

  const parsed = reviewSchema.safeParse({
    section_id: formData.get('section_id'),
    action: formData.get('action'),
    final_text: formData.get('final_text'),
  });

  if (!parsed.success) {
    return {
      status: 'error',
      message: parsed.error.errors[0]?.message ?? 'Invalid section update.',
    };
  }

  const { section_id, action } = parsed.data;
  const rawFinalText = parsed.data.final_text ?? '';

  const { data: section, error: sectionError } = await supabase
    .from('generated_cv_sections')
    .select('*')
    .eq('id', section_id)
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (sectionError || !section) {
    return {
      status: 'error',
      message: 'Section not found or access denied.',
    };
  }

  const now = new Date().toISOString();
  const finalText = action === 'approve' ? rawFinalText.trim() : section.original_text;

  if (action === 'approve' && finalText.length === 0) {
    return {
      status: 'error',
      message: 'Please review the text before approving this section.',
    };
  }

  const { error: updateError } = await supabase
    .from('generated_cv_sections')
    .update({
      status: action === 'approve' ? 'approved' : 'rejected',
      final_text: finalText,
      updated_at: now,
    })
    .eq('id', section_id)
    .eq('user_id', session.user.id);

  if (updateError) {
    return {
      status: 'error',
      message: 'Could not update the section. Please try again.',
    };
  }

  const { data: siblingStatuses, error: siblingError } = await supabase
    .from('generated_cv_sections')
    .select('status')
    .eq('generated_cv_id', section.generated_cv_id)
    .eq('user_id', session.user.id);

  if (!siblingError && siblingStatuses) {
    const statuses = siblingStatuses.map((item) => item.status ?? 'pending');
    let overall: 'approved' | 'rejected' | 'in_review' = 'in_review';

    if (statuses.every((s) => s === 'approved')) {
      overall = 'approved';
    } else if (statuses.some((s) => s === 'rejected')) {
      overall = 'rejected';
    }

    await supabase
      .from('generated_cvs')
      .update({ status: overall, updated_at: now })
      .eq('id', section.generated_cv_id)
      .eq('user_id', session.user.id);
  }

  revalidatePath('/app');
  return {
    status: 'success',
    message: action === 'approve' ? 'Section approved.' : 'Section rejected.',
  };
}
