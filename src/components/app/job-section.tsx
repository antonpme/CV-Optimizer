'use client';

import { useMemo, useState, useTransition } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import type { Database } from '@/types/database';
import type { GenerateState, JobActionState } from '@/app/app/job.actions';
import { addJobDescription, deleteJobDescription, generateTailoredCvs } from '@/app/app/job.actions';

type JobRow = Database['public']['Tables']['job_descriptions']['Row'];

const addInitialState: JobActionState = { status: 'idle' };
const generateInitialState: GenerateState = { status: 'idle' };

function SubmitButton({ label, disabled }: { label: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
      disabled={pending || disabled}
    >
      {pending ? `${label}...` : label}
    </button>
  );
}

function DeleteButton({ jobId }: { jobId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => deleteJobDescription(jobId))}
      disabled={pending}
      className="text-xs font-semibold text-rose-600 hover:text-rose-700 disabled:cursor-not-allowed"
    >
      {pending ? 'Removing...' : 'Remove'}
    </button>
  );
}

export function JobSection({ jobs, hasReferenceCv }: { jobs: JobRow[]; hasReferenceCv: boolean }) {
  const [addState, addAction] = useFormState(addJobDescription, addInitialState);
  const [generateState, generateAction] = useFormState(generateTailoredCvs, generateInitialState);
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);

  const jobCount = jobs.length;

  const toggleSelection = (id: string, checked: boolean) => {
    setSelectedJobIds((prev) => {
      if (checked) {
        if (prev.includes(id)) return prev;
        return [...prev, id];
      }
      return prev.filter((jobId) => jobId !== id);
    });
  };

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">Job descriptions</h2>
        <p className="text-sm text-slate-600">
          Paste job descriptions you want to tailor your CV for. Keep entries truthful and up to date.
        </p>
      </div>

      <form action={addAction} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        {addState.status === 'success' && (
          <p className="rounded-md bg-emerald-100 px-3 py-2 text-sm text-emerald-900">
            {addState.message ?? 'Job description added.'}
          </p>
        )}
        {addState.status === 'error' && addState.message && (
          <p className="rounded-md bg-rose-100 px-3 py-2 text-sm text-rose-900">{addState.message}</p>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <label htmlFor="job-title" className="text-sm font-medium text-slate-700">
              Job title (optional)
            </label>
            <input id="job-title" name="title" className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Product Manager" />
            {addState.errors?.title && <p className="text-xs text-rose-600">{addState.errors.title}</p>}
          </div>
          <div className="grid gap-2">
            <label htmlFor="job-company" className="text-sm font-medium text-slate-700">
              Company (optional)
            </label>
            <input id="job-company" name="company" className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Acme Corp" />
            {addState.errors?.company && <p className="text-xs text-rose-600">{addState.errors.company}</p>}
          </div>
        </div>

        <div className="grid gap-2">
          <label htmlFor="job-text" className="text-sm font-medium text-slate-700">
            Job description text
          </label>
          <textarea
            id="job-text"
            name="text"
            rows={6}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="Paste the responsibilities, requirements, and company summary."
          />
          {addState.errors?.text && <p className="text-xs text-rose-600">{addState.errors.text}</p>}
          <p className="text-xs text-slate-500">Min 80 characters - Max 8000 characters - Stored job descriptions: {jobCount}/20</p>
        </div>

        <SubmitButton label="Save job" />
      </form>

      <div className="grid gap-3">
        {jobs.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
            You haven&apos;t added any job descriptions yet. Paste roles you&apos;re targeting to generate tailored CVs.
          </p>
        ) : (
          jobs.map((job) => (
            <article key={job.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-slate-900">{job.title ?? 'Untitled role'}</h3>
                  <p className="text-xs text-slate-500">
                    {job.company ? `${job.company} - ` : ''}
                    Added {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'recently'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      name="selected"
                      className="h-4 w-4"
                      checked={selectedJobIds.includes(job.id)}
                      onChange={(event) => toggleSelection(job.id, event.currentTarget.checked)}
                    />
                    Select for tailoring
                  </label>
                  <DeleteButton jobId={job.id} />
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-700">
                {job.text_content.length > 400 ? `${job.text_content.slice(0, 400)}...` : job.text_content}
              </p>
            </article>
          ))
        )}
      </div>

      <form action={generateAction} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <input type="hidden" name="embellishment_level" value="3" />
        {selectedJobIds.map((id) => (
          <input key={id} type="hidden" name="job_ids" value={id} />
        ))}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-900">Generate tailored CVs</h3>
            <p className="text-xs text-slate-500">
              Select up to 5 job descriptions and generate tailored CVs sequentially. Requires an active reference CV.
            </p>
          </div>
          <SubmitButton label="Generate" disabled={!hasReferenceCv || selectedJobIds.length === 0} />
        </div>

        {generateState.status === 'success' && (
          <p className="rounded-md bg-emerald-100 px-3 py-2 text-sm text-emerald-900">
            {generateState.message ?? 'Tailored CVs generated.'}
          </p>
        )}
        {generateState.status === 'partial' && generateState.message && (
          <p className="rounded-md bg-amber-100 px-3 py-2 text-sm text-amber-900">{generateState.message}</p>
        )}
        {generateState.status === 'error' && generateState.message && (
          <p className="rounded-md bg-rose-100 px-3 py-2 text-sm text-rose-900">{generateState.message}</p>
        )}

        <button
          type="button"
          onClick={() => setSelectedJobIds([])}
          className="self-start text-xs font-medium text-slate-600 underline-offset-4 hover:underline"
        >
          Clear selection
        </button>

        <div className="text-xs text-slate-500">
          {hasReferenceCv
            ? selectedJobIds.length > 0
              ? `${selectedJobIds.length} job(s) selected.`
              : 'Select roles above to enable generation.'
            : 'Set a reference CV before generating tailored versions.'}
        </div>
      </form>
    </section>
  );
}

export function useJobSelections(jobs: JobRow[]) {
  return useMemo(() => new Map(jobs.map((job) => [job.id, job])), [jobs]);
}

