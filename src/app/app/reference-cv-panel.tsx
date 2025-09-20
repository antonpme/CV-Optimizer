import { diff_match_patch } from 'diff-match-patch';
import Link from 'next/link';
import { OptimizeReferenceForm } from '@/components/app/optimize-reference-form';
import type { Database, Json } from '@/types/database';

type CvRow = Database['public']['Tables']['cvs']['Row'];
type OptimizedRow = Database['public']['Tables']['optimized_cvs']['Row'];

const dmp = new diff_match_patch();

const renderDiffHtml = (original: string, optimized: string) => {
  const diffs = dmp.diff_main(original, optimized) as Array<[number, string]>;
  dmp.diff_cleanupSemantic(diffs);

  return diffs
    .map(([type, text]) => {
      const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      if (type === 0) return `<span>${escaped}</span>`;
      if (type === 1) return `<mark class="bg-emerald-100 text-emerald-900">${escaped}</mark>`;
      return `<del class="text-rose-500/80">${escaped}</del>`;
    })
    .join('');
};

type OptimizationSummary = {
  changes: Array<{ section: string; change: string; confidence?: number }>;
  recommendations: string[];
  overall_confidence: number | null;
};

const parseSummary = (summary: Json | null): OptimizationSummary | null => {
  if (!summary || typeof summary !== 'object' || Array.isArray(summary)) return null;
  const raw = summary as Record<string, unknown>;
  const changes = Array.isArray(raw.changes_summary)
    ? (raw.changes_summary as Array<Record<string, unknown>>)
        .map((item) => ({
          section: typeof item.section === 'string' ? item.section : 'General',
          change: typeof item.change === 'string' ? item.change : '',
          confidence: typeof item.confidence === 'number' ? item.confidence : undefined,
        }))
        .filter((item) => item.change.length > 0)
    : [];

  const recommendations = Array.isArray(raw.recommendations)
    ? (raw.recommendations as unknown[])
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : [];

  const overall = typeof raw.overall_confidence === 'number' ? raw.overall_confidence : null;

  return {
    changes,
    recommendations,
    overall_confidence: overall,
  };
};

export function ReferenceCvPanel({
  referenceCv,
  latestOptimization,
  defaultLevel,
}: {
  referenceCv: CvRow | null;
  latestOptimization: OptimizedRow | null;
  defaultLevel: number;
}) {
  if (!referenceCv) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Reference CV</h2>
        <p className="mt-2 text-sm text-slate-600">
          Upload a CV and mark it as reference to enable AI optimisation.
        </p>
        <p className="mt-3 text-xs text-slate-500">
          Use the “Set as reference” action in the CV library to choose your baseline document.
        </p>
      </section>
    );
  }

  const summary = parseSummary(latestOptimization?.optimization_summary ?? null);

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Reference CV</h2>
            <p className="text-sm text-slate-600">
              {referenceCv.title ?? 'Untitled CV'} · Last updated{' '}
              {referenceCv.updated_at ? new Date(referenceCv.updated_at).toLocaleString() : 'unknown'}
            </p>
          </div>
          <Link
            href="#cv-library"
            className="text-sm font-medium text-slate-600 underline-offset-4 hover:underline"
          >
            Manage CVs
          </Link>
        </div>

        <div className="mt-4 space-y-4">
          <OptimizeReferenceForm cvId={referenceCv.id} defaultLevel={defaultLevel} />

          {latestOptimization ? (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">AI suggestions</h3>
              {summary?.changes.length ? (
                <ul className="list-inside list-disc text-sm text-slate-700">
                  {summary.changes.map((change, idx) => (
                    <li key={`${change.section}-${idx}`}>
                      <span className="font-medium">{change.section}:</span> {change.change}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-600">No change summary provided.</p>
              )}

              {summary?.recommendations.length ? (
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-slate-900">Recommendations</h4>
                  <ul className="list-inside list-disc text-sm text-slate-700">
                    {summary.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <h4 className="mb-2 text-sm font-semibold text-slate-900">Diff preview</h4>
                <div
                  className="prose prose-sm max-w-none text-slate-700"
                  dangerouslySetInnerHTML={{
                    __html: renderDiffHtml(referenceCv.text_content, latestOptimization.optimized_text),
                  }}
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              No AI optimisations yet. Use the optimisation form above to generate a revised version.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
