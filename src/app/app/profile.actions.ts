'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClientForServerAction } from '@/lib/supabase';

export type ProfileActionState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  errors?: Record<string, string>;
};

const profileSchema = z.object({
  full_name: z.string().max(120).optional(),
  job_title: z.string().max(120).optional(),
  location: z.string().max(120).optional(),
  professional_summary: z.string().max(2000).optional(),
  website_url: z.string().url().optional(),
  linkedin_url: z.string().url().optional(),
  github_url: z.string().url().optional(),
  portfolio_url: z.string().url().optional(),
  embellishment_level: z.coerce.number().int().min(1).max(5),
  data_retention_days: z.coerce.number().int().min(7).max(365),
  ai_training_consent: z.boolean(),
});

const errorMessages: Record<string, string> = {
  full_name: 'Full name must be 120 characters or fewer.',
  job_title: 'Job title must be 120 characters or fewer.',
  location: 'Location must be 120 characters or fewer.',
  professional_summary: 'Summary must be 2000 characters or fewer.',
  website_url: 'Website must be a valid URL (https://…).',
  linkedin_url: 'LinkedIn must be a valid URL (https://…).',
  github_url: 'GitHub must be a valid URL (https://…).',
  portfolio_url: 'Portfolio must be a valid URL (https://…).',
  embellishment_level: 'Embellishment must be between 1 and 5.',
  data_retention_days: 'Retention days must be between 7 and 365.',
};

const normalizeString = (value: FormDataEntryValue | null) => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

const numberString = (value: FormDataEntryValue | null, fallback: number) => {
  if (typeof value !== 'string') return String(fallback);
  const trimmed = value.trim();
  return trimmed.length ? trimmed : String(fallback);
};

export async function updateProfile(formData: FormData): Promise<ProfileActionState> {
  const supabase = createClientForServerAction();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { status: 'error', message: 'You must be signed in.' };
  }

  const parsed = profileSchema.safeParse({
    full_name: normalizeString(formData.get('full_name')),
    job_title: normalizeString(formData.get('job_title')),
    location: normalizeString(formData.get('location')),
    professional_summary: normalizeString(formData.get('professional_summary')),
    website_url: normalizeString(formData.get('website_url')),
    linkedin_url: normalizeString(formData.get('linkedin_url')),
    github_url: normalizeString(formData.get('github_url')),
    portfolio_url: normalizeString(formData.get('portfolio_url')),
    embellishment_level: numberString(formData.get('embellishment_level'), 3),
    data_retention_days: numberString(formData.get('data_retention_days'), 90),
    ai_training_consent: formData.get('ai_training_consent') === 'on',
  });

  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const errors: Record<string, string> = {};
    for (const [field, messages] of Object.entries(flat.fieldErrors)) {
      if (!messages?.length) continue;
      errors[field] = errorMessages[field] ?? messages[0];
    }
    return {
      status: 'error',
      message: 'Please fix the highlighted fields and try again.',
      errors,
    };
  }

  const data = parsed.data;
  const payload = {
    user_id: session.user.id,
    full_name: data.full_name ?? null,
    job_title: data.job_title ?? null,
    location: data.location ?? null,
    professional_summary: data.professional_summary ?? null,
    website_url: data.website_url ?? null,
    linkedin_url: data.linkedin_url ?? null,
    github_url: data.github_url ?? null,
    portfolio_url: data.portfolio_url ?? null,
    embellishment_level: data.embellishment_level,
    data_retention_days: data.data_retention_days,
    ai_training_consent: data.ai_training_consent,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('profiles').upsert(payload, {
    onConflict: 'user_id',
  });

  if (error) {
    return {
      status: 'error',
      message: 'Could not save your profile. Please try again.',
    };
  }

  revalidatePath('/app');
  return { status: 'success', message: 'Profile updated.' };
}

