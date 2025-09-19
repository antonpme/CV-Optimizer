'use client';

import { useTransition } from 'react';
import { setReferenceCv } from '@/app/app/cv.actions';

type Props = {
  cvId: string;
  isReference: boolean;
};

export function ReferenceButton({ cvId, isReference }: Props) {
  const [pending, startTransition] = useTransition();

  if (isReference) {
    return (
      <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
        Reference CV
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => startTransition(async () => setReferenceCv(cvId))}
      disabled={pending}
      className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? 'Setting…' : 'Set as reference'}
    </button>
  );
}

