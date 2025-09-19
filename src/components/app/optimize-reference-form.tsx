'use client';

import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import type { OptimizeCvState } from '@/app/app/cv.actions';
import { optimizeReferenceCv } from '@/app/app/cv.actions';

const initialState: OptimizeCvState = { status: 'idle' };

export function OptimizeReferenceForm({
  cvId,
  defaultLevel,
}: {
  cvId: string;
  defaultLevel: number;
}) {
  const [state, formAction] = useFormState(optimizeReferenceCv, initialState);
  const [levelDisplay, setLevelDisplay] = useState(defaultLevel);
  const { pending } = useFormStatus();

  useEffect(() => {
    if (state.status === 'success') {
      const timer = window.setTimeout(() => {
        // Allow message to fade naturally; revalidation reloads diff.
      }, 3000);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [state.status]);

  return (
    <form action={formAction} className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4">
      <input type="hidden" name="cv_id" value={cvId} />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-900">Optimise reference CV</p>
          <label className="text-xs font-medium text-slate-600" htmlFor="embellishment_level">
            Embellishment level: {levelDisplay}
          </label>
          <input
            id="embellishment_level"
            name="embellishment_level"
            type="range"
            min={1}
            max={5}
            defaultValue={defaultLevel}
            className="w-full sm:w-64"
            onChange={(event) => setLevelDisplay(Number(event.currentTarget.value))}
          />
        </div>
        <button
          type="submit"
          className="h-fit rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={pending}
        >
          {pending ? 'Optimising…' : 'Run optimisation'}
        </button>
      </div>

      {state.status === 'success' && (
        <p className="rounded-md bg-emerald-100 px-3 py-2 text-sm text-emerald-900">
          {state.message ?? 'Optimisation complete.'}
        </p>
      )}

      {state.status === 'error' && state.message && (
        <p className="rounded-md bg-rose-100 px-3 py-2 text-sm text-rose-900">
          {state.message}
        </p>
      )}
    </form>
  );
}
