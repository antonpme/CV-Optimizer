'use client';

import { useEffect, useMemo, useState } from "react";
import { useFormState } from "react-dom";
import DiffMatchPatch from "diff-match-patch";
import type { Database, Json } from "@/types/database";
import { reviewGeneratedSection } from "@/app/app/generated.actions";

const dmp = new DiffMatchPatch();

const escapeHtml = (input: string) =>
  input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const diffHtml = (original: string, revised: string) => {
  const diffs = dmp.diff_main(original, revised);
  dmp.diff_cleanupSemantic(diffs);
  return diffs
    .map(([type, text]) => {
      const safe = escapeHtml(text);
      if (type === 1) {
        return `<span class="bg-emerald-100 text-emerald-900 px-1">${safe}</span>`;
      }
      if (type === -1) {
        return `<span class="bg-rose-100 text-rose-900 line-through px-1">${safe}</span>`;
      }
      return `<span>${safe}</span>`;
    })
    .join("");
};

type GeneratedRow = Database["public"]["Tables"]["generated_cvs"]["Row"];
type JobRow = Database["public"]["Tables"]["job_descriptions"]["Row"];
type SectionRow = Database["public"]["Tables"]["generated_cv_sections"]["Row"];
type ExportRow = Database["public"]["Tables"]["cv_exports"]["Row"];

type Props = {
  generated: GeneratedRow[];
  jobs: JobRow[];
  sectionsByCv: Record<string, SectionRow[]>;
  exportsByCv: Record<string, ExportRow[]>;
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
  if (!notes || typeof notes !== "object" || Array.isArray(notes)) return null;
  const record = notes as Record<string, unknown>;
  const arrayOfStrings = (value: unknown): string[] =>
    Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : [];

  return {
    sections_enhanced: arrayOfStrings(record.sections_enhanced),
    keywords_added: arrayOfStrings(record.keywords_added),
    achievements_highlighted: arrayOfStrings(record.achievements_highlighted),
  };
};

type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const initialFormState: FormState = { status: "idle" };

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  in_review: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
};

function SectionReview({ section }: { section: SectionRow }) {
  const [state, formAction] = useFormState(reviewGeneratedSection, initialFormState);
  const [draft, setDraft] = useState(section.final_text ?? section.suggested_text);

  useEffect(() => {
    setDraft(section.final_text ?? section.suggested_text);
  }, [section.final_text, section.suggested_text, section.id]);

  const diffMarkup = useMemo(
    () => diffHtml(section.original_text, section.suggested_text),
    [section.original_text, section.suggested_text],
  );

  const badgeClass = statusStyles[section.status ?? "pending"] ?? "bg-slate-100 text-slate-700";

  return (
    <div className="space-y-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">{section.section_name}</p>
          <p className="text-xs text-slate-500">
            {section.updated_at ? `Last updated ${new Date(section.updated_at).toLocaleString()}` : "Pending review"}
          </p>
        </div>
        <span className={`inline-flex h-6 items-center rounded-full px-2 text-xs font-semibold ${badgeClass}`}>
          {section.status ?? "pending"}
        </span>
      </div>

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Suggested changes</h4>
        <div
          className="prose prose-sm max-w-none rounded-md border border-slate-200 bg-slate-50 p-3 text-slate-700"
          dangerouslySetInnerHTML={{ __html: diffMarkup }}
        />
      </div>

      {section.rationale ? (
        <p className="text-xs text-slate-600">
          Rationale: <span className="text-slate-700">{section.rationale}</span>
        </p>
      ) : null}

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="section_id" value={section.id} />
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor={`section-${section.id}`}>
            Final text
          </label>
          <textarea
            id={`section-${section.id}`}
            name="final_text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="min-h-[160px] w-full rounded-md border border-slate-300 bg-white p-3 text-sm text-slate-800 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="submit"
            name="action"
            value="approve"
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            Approve section
          </button>
          <button
            type="submit"
            name="action"
            value="reject"
            className="inline-flex items-center justify-center rounded-md border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
          >
            Reject and keep original
          </button>
        </div>
        {state.status === "error" ? (
          <p className="text-xs text-rose-600">{state.message}</p>
        ) : null}
        {state.status === "success" ? (
          <p className="text-xs text-emerald-600">{state.message}</p>
        ) : null}
      </form>
    </div>
  );
}

function formatStatus(status: string | null): string {
  if (!status) return "pending";
  return status.replace("_", " ");
}

export function GeneratedCvSection({ generated, jobs, sectionsByCv, exportsByCv }: Props) {
  const jobsMap = jobLookup(jobs);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!generated.length) {
    return (
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">Generated CVs</h2>
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
          When you generate tailored CVs, they will show up here with match notes, sections to review, and export options.
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
          const sections = sectionsByCv[item.id] ?? [];
          const exports = exportsByCv[item.id] ?? [];
          const statusBadge = statusStyles[item.status ?? "pending"] ?? "bg-slate-100 text-slate-700";
          const hasSections = sections.length > 0;
          const allSectionsApproved = hasSections ? sections.every((section) => section.status === "approved") : true;
          const canExport = hasSections ? allSectionsApproved && item.status === "approved" : true;

          return (
            <article key={item.id} className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {job?.title ?? "Untitled role"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {job?.company ? `${job.company} · ` : ""}
                    Generated {item.created_at ? new Date(item.created_at).toLocaleString() : "recently"}
                  </p>
                  {item.match_score !== null && (
                    <p className="text-xs text-emerald-700">Match score: {(item.match_score * 100).toFixed(0)}%</p>
                  )}
                  {exports.length ? (
                    <p className="text-xs text-slate-500">
                      Recent exports: {exports[0].format.toUpperCase()} at {exports[0].created_at ? new Date(exports[0].created_at).toLocaleString() : "n/a"}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex h-6 items-center rounded-full px-2 text-xs font-semibold ${statusBadge}`}>
                    {formatStatus(item.status)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="self-start rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    {isExpanded ? "Hide details" : "Review sections"}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="space-y-4">
                  {notes ? (
                    <div className="space-y-1 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                      <h4 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Optimization notes</h4>
                      <p>Sections enhanced: {notes.sections_enhanced.join(", ") || "n/a"}</p>
                      <p>Keywords added: {notes.keywords_added.join(", ") || "n/a"}</p>
                      <p>Achievements highlighted: {notes.achievements_highlighted.join(", ") || "n/a"}</p>
                    </div>
                  ) : null}

                  {sections.length ? (
                    <div className="space-y-3">
                      {sections.map((section) => (
                        <SectionReview key={section.id} section={section} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600">
                      This CV was generated before section review was available. Regenerate to enable approvals.
                    </p>
                  )}

                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Export</h4>
                    {canExport ? (
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={`/api/export/cv/${item.id}?format=html`}
                          className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-100"
                        >
                          Download HTML
                        </a>
                        <a
                          href={`/api/export/cv/${item.id}?format=docx`}
                          className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-100"
                        >
                          Download DOCX
                        </a>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-600">Approve all sections to enable export.</p>
                    )}
                    {exports.length ? (
                      <ul className="space-y-1 text-xs text-slate-500">
                        {exports.slice(0, 3).map((entry) => (
                          <li key={entry.id}>
                            {entry.format.toUpperCase()} · {entry.created_at ? new Date(entry.created_at).toLocaleString() : "n/a"} · {entry.status}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Full tailored text</h4>
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 whitespace-pre-wrap">
                      {item.tailored_text}
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
