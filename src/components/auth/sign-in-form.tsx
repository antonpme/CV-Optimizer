'use client';

import { useFormState, useFormStatus } from 'react-dom';
import type { SignInState } from '@/app/actions/auth';
import { signInWithEmail } from '@/app/actions/auth';

const initialState: SignInState = { status: 'idle' };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
      disabled={pending}
    >
      {pending ? 'Sending…' : 'Send magic link'}
    </button>
  );
}

export function SignInForm() {
  const [state, formAction] = useFormState(signInWithEmail, initialState);

  return (
    <form className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm" action={formAction}>
      <div className="grid gap-2">
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          placeholder="you@example.com"
          autoComplete="email"
        />
        <p className="text-xs text-slate-500">
          We&apos;ll email you a one-time sign-in link. No password required.
        </p>
      </div>

      <SubmitButton />

      {state.status === 'sent' && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {state.message}
        </p>
      )}

      {state.status === 'error' && state.message && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.message}
        </p>
      )}
    </form>
  );
}
