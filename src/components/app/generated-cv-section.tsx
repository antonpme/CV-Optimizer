'use client';

import { useState } from 'react';
import type { Database, Json } from '@/types/database';

type GeneratedRow = Database['public']['Tables']['generated_cvs']['Row'];
type JobRow = Database['public']['Tables']['job_descriptions']['Row'];

type Props = {
  generated: GeneratedRow[];
  jobs: JobRow[];
};

type Notes = {
  sections_enhanced: string[];
  keywords_added: string[];
  achievements_highlighted: string[];
};

const jobLookup = (jobs: JobRow[]) => {
  const map = new Map<string, JobRow>();
  for (const job of jobs) {
    map.set(job.id, job);
  }
  return map;
};

const parseNotes = (notes: Json | null): Notes | null => {
  if (!notes || typeof notes !== 'object' || Array.isArray(notes)) return null;
  const record = notes as Record<string, unknown>;
  const arrayOfStrings = (value: unknown): string[] =>
    Array.isArray(value)
      ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      : [];

  return {
    sections_enhanced: arrayOfStrings(record.sections_enhanced),
    keywords_added: arrayOfStrings(record.keywords_added),
    achievements_highlighted: arrayOfStrings(record.achievements_highlighted),
  };
};

export function GeneratedCvSection({ generated, jobs }: Props) {
  const jobsMap = jobLookup(jobs);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!generated.length) {
    return (
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">Generated CVs</h2>
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
          When you generate tailored CVs, they will show up here with match notes and job details.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Generated CVs</h2>
      <div className="grid gap-3">
        {generated.map((item) => {
          const job = jobsMap.get(item.jd_id);
          const isExpanded = expandedId === item.id;
          const notes = parseNotes(item.optimization_notes ?? null);

          return (
            <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {job?.title ?? 'Untitled role'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {job?.company ? `${job.company} · ` : ''}
                    Generated {item.created_at ? new Date(item.created_at).toLocaleString() : 'recently'}
                  </p>
                  {item.match_score !== null && (
                    <p className="text-xs text-emerald-700">Match score: {(item.match_score * 100).toFixed(0)}%</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="self-start rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  {isExpanded ? 'Hide details' : 'View tailored CV'}
                </button>
              </div>
              {isExpanded && (
                <div className="mt-4 space-y-3 text-sm text-slate-700">
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-4 whitespace-pre-wrap">
                    {item.tailored_text}
                  </div>
                  {notes ? (
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</h4>
                      <p className="text-xs text-slate-600">
                        Sections enhanced: {notes.sections_enhanced.join(', ') || 'n/a'}
                      </p>
                      <p className="text-xs text-slate-600">
                        Keywords added: {notes.keywords_added.join(', ') || 'n/a'}
                      </p>
                      <p className="text-xs text-slate-600">
                        Achievements highlighted: {notes.achievements_highlighted.join(', ') || 'n/a'}
                      </p>
                    </div>
                  ) : null}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
