'use client';

import { useFormState, useFormStatus } from 'react-dom';
import type { ProfileActionState } from './profile.actions';
import { updateProfile } from './profile.actions';

type Props = {
  initial: {
    user_id: string;
    full_name: string | null;
    job_title: string | null;
    location: string | null;
    professional_summary: string | null;
    website_url: string | null;
    linkedin_url: string | null;
    github_url: string | null;
    portfolio_url: string | null;
    embellishment_level: number | null;
    data_retention_days: number | null;
    ai_training_consent: boolean | null;
  } | null;
};

const initialState: ProfileActionState = { status: 'idle' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
      disabled={pending}
    >
      {pending ? 'Saving…' : 'Save profile'}
    </button>
  );
}

export function ProfileForm({ initial }: Props) {
  const [state, formAction] = useFormState(updateProfile, initialState);
  const fieldError = (field: string) => state.errors?.[field] ?? '';

  return (
    <form
      action={formAction}
      className="grid gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      {state.status === 'success' && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {state.message ?? 'Profile saved successfully.'}
        </p>
      )}
      {state.status === 'error' && state.message && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.message}
        </p>
      )}

      <div className="grid gap-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="full_name">
          Full name
        </label>
        <input
          id="full_name"
          name="full_name"
          defaultValue={initial?.full_name ?? ''}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        {fieldError('full_name') && (
          <p className="text-xs text-rose-600">{fieldError('full_name')}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="job_title">
            Job title
          </label>
          <input
            id="job_title"
            name="job_title"
            defaultValue={initial?.job_title ?? ''}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          {fieldError('job_title') && (
            <p className="text-xs text-rose-600">{fieldError('job_title')}</p>
          )}
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="location">
            Location
          </label>
          <input
            id="location"
            name="location"
            defaultValue={initial?.location ?? ''}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          {fieldError('location') && (
            <p className="text-xs text-rose-600">{fieldError('location')}</p>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="professional_summary">
          Professional summary
        </label>
        <textarea
          id="professional_summary"
          name="professional_summary"
          defaultValue={initial?.professional_summary ?? ''}
          rows={5}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        {fieldError('professional_summary') && (
          <p className="text-xs text-rose-600">{fieldError('professional_summary')}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="website_url">
            Website
          </label>
          <input
            id="website_url"
            name="website_url"
            defaultValue={initial?.website_url ?? ''}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="https://example.com"
          />
          {fieldError('website_url') && (
            <p className="text-xs text-rose-600">{fieldError('website_url')}</p>
          )}
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="linkedin_url">
            LinkedIn
          </label>
          <input
            id="linkedin_url"
            name="linkedin_url"
            defaultValue={initial?.linkedin_url ?? ''}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="https://www.linkedin.com/in/you"
          />
          {fieldError('linkedin_url') && (
            <p className="text-xs text-rose-600">{fieldError('linkedin_url')}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="github_url">
            GitHub
          </label>
          <input
            id="github_url"
            name="github_url"
            defaultValue={initial?.github_url ?? ''}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="https://github.com/you"
          />
          {fieldError('github_url') && (
            <p className="text-xs text-rose-600">{fieldError('github_url')}</p>
          )}
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="portfolio_url">
            Portfolio
          </label>
          <input
            id="portfolio_url"
            name="portfolio_url"
            defaultValue={initial?.portfolio_url ?? ''}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="https://portfolio.com"
          />
          {fieldError('portfolio_url') && (
            <p className="text-xs text-rose-600">{fieldError('portfolio_url')}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="embellishment_level">
            Embellishment level (1–5)
          </label>
          <input
            id="embellishment_level"
            name="embellishment_level"
            type="number"
            min={1}
            max={5}
            defaultValue={initial?.embellishment_level ?? 3}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          {fieldError('embellishment_level') && (
            <p className="text-xs text-rose-600">{fieldError('embellishment_level')}</p>
          )}
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="data_retention_days">
            Retention days
          </label>
          <input
            id="data_retention_days"
            name="data_retention_days"
            type="number"
            min={7}
            max={365}
            defaultValue={initial?.data_retention_days ?? 90}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          {fieldError('data_retention_days') && (
            <p className="text-xs text-rose-600">{fieldError('data_retention_days')}</p>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700" htmlFor="ai_training_consent">
          <input
            id="ai_training_consent"
            name="ai_training_consent"
            type="checkbox"
            defaultChecked={!!initial?.ai_training_consent}
            className="h-4 w-4"
          />
          Allow anonymized training
        </label>
      </div>

      <SubmitButton />
    </form>
  );
}

