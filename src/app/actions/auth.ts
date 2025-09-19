'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClientForServerAction } from '@/lib/supabase';

type SignInState = {
  status: 'idle' | 'sent' | 'error';
  message?: string;
};

const initialState: SignInState = { status: 'idle' };

export { initialState as signInInitialState };

export async function signInWithEmail(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get('email') || '').trim().toLowerCase();

  if (!email) {
    return { status: 'error', message: 'Email is required.' };
  }

  const supabase = createClientForServerAction();
  const origin = headers().get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? '';
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
