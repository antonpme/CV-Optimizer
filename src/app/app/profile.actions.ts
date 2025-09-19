'use server';

import { revalidatePath } from 'next/cache';
import { createClientForServerAction } from '@/lib/supabase';

export async function updateProfile(formData: FormData) {
  const supabase = createClientForServerAction();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return;

  const userId = session.user.id;

  const payload = {
    user_id: userId,
    full_name: (formData.get('full_name') as string) || null,
    job_title: (formData.get('job_title') as string) || null,
    location: (formData.get('location') as string) || null,
    professional_summary: (formData.get('professional_summary') as string) || null,
    website_url: (formData.get('website_url') as string) || null,
    linkedin_url: (formData.get('linkedin_url') as string) || null,
    github_url: (formData.get('github_url') as string) || null,
    portfolio_url: (formData.get('portfolio_url') as string) || null,
    embellishment_level: Number(formData.get('embellishment_level') ?? 3),
    data_retention_days: Number(formData.get('data_retention_days') ?? 90),
    ai_training_consent: formData.get('ai_training_consent') === 'on',
  };

  await supabase.from('profiles').upsert(payload, { onConflict: 'user_id' });
  revalidatePath('/app');
}

