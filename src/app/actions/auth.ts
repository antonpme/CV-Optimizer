'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClientForServerAction } from '@/lib/supabase';

export type SignInState = {
  status: 'idle' | 'sent' | 'error';
  message?: string;
};

export async function signInWithEmail(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get('email') || '').trim().toLowerCase();

  if (!email) {
    return { status: 'error', message: 'Email is required.' };
  }

  const supabase = createClientForServerAction();
  // In Next 15, headers() is async in server actions
  const hdrs = await headers();
  const origin = hdrs.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const emailRedirectTo = origin ? `${origin}/auth/callback` : undefined;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo,
    },
  });

  if (error) {
    return { status: 'error', message: error.message };
  }

  return {
    status: 'sent',
    message: 'Check your inbox for the magic link.',
  };
}

export async function signOut() {
  const supabase = createClientForServerAction();
  await supabase.auth.signOut();
  redirect('/');
}
