'use server';

import { revalidatePath } from 'next/cache';
import { PLAN_PRESETS, type PlanPresetKey } from './plan-presets';
import { createClientForServerAction } from '@/lib/supabase';

type PlanPreset = PlanPresetKey;

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
