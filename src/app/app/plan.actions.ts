'use server';

import { revalidatePath } from 'next/cache';
import { createClientForServerAction } from '@/lib/supabase';

const PLAN_PRESETS = {
  free: {
    plan: 'free',
    gen_rate_limit: 5,
    gen_window_seconds: 60,
    gen_monthly_limit: 50,
    opt_rate_limit: 8,
    opt_window_seconds: 60,
    opt_monthly_limit: 30,
    allow_export: true,
  },
  pro: {
    plan: 'pro',
    gen_rate_limit: 15,
    gen_window_seconds: 60,
    gen_monthly_limit: 300,
    opt_rate_limit: 20,
    opt_window_seconds: 60,
    opt_monthly_limit: 120,
    allow_export: true,
  },
} satisfies Record<string, {
  plan: string;
  gen_rate_limit: number;
  gen_window_seconds: number;
  gen_monthly_limit: number;
  opt_rate_limit: number;
  opt_window_seconds: number;
  opt_monthly_limit: number;
  allow_export: boolean;
}>;

export type PlanPreset = keyof typeof PLAN_PRESETS;

export async function setPlan(plan: PlanPreset) {
  const supabase = createClientForServerAction();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    throw new Error('Not authenticated.');
  }

  const preset = PLAN_PRESETS[plan];
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from('user_entitlements')
    .select('user_id')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('user_entitlements')
      .update({
        ...preset,
        updated_at: now,
        expires_at: null,
      })
      .eq('user_id', session.user.id);

    if (error) {
      throw new Error(error.message);
    }
  } else {
    const { error } = await supabase.from('user_entitlements').insert({
      user_id: session.user.id,
      ...preset,
      created_at: now,
      updated_at: now,
      expires_at: null,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  revalidatePath('/app');
}
