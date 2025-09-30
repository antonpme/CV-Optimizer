import { setPlan } from '@/app/app/plan.actions';
import { PLAN_PRESETS } from '@/lib/plan-presets';
import type { UserLimits } from '@/lib/rate-limit';

type Props = {
  limits: UserLimits;
  generationUsed: number;
  optimizationUsed: number;
};

const setFreePlan = setPlan.bind(null, 'free');
const setProPlan = setPlan.bind(null, 'pro');
const freePreset = PLAN_PRESETS.free;

const formatPercent = (used: number, limit: number) => {
  if (limit <= 0) {
    return 0;
  }
  return Math.min(100, Math.round((used / limit) * 100));
};

const formatLimitLabel = (used: number, limit: number) => {
  if (limit <= 0) {
    return `${used} used (unlimited)`;
  }
  return `${used} / ${limit}`;
};

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const percent = formatPercent(used, limit);
  const display = formatLimitLabel(used, limit);

  return (
    <div className="space-y-1" role="group" aria-label={label}>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{label}</span>
        <span aria-live="polite">{display}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100" aria-hidden="true">
        <div
          className="h-2 rounded-full bg-slate-600"
          style={{ width: `${limit <= 0 ? 100 : percent}%` }}
        />
      </div>
    </div>
  );
}

export function PlanUsageCard({ limits, generationUsed, optimizationUsed }: Props) {
  const freeDefaultsApplied =
    limits.plan === 'free' &&
    limits.generation.rateLimit === freePreset.gen_rate_limit &&
    limits.generation.windowSeconds === freePreset.gen_window_seconds &&
    limits.generation.monthlyLimit === freePreset.gen_monthly_limit &&
    limits.optimization.rateLimit === freePreset.opt_rate_limit &&
    limits.optimization.windowSeconds === freePreset.opt_window_seconds &&
    limits.optimization.monthlyLimit === freePreset.opt_monthly_limit &&
    limits.allowExport === freePreset.allow_export;
  const planLabel = limits.plan.charAt(0).toUpperCase() + limits.plan.slice(1);
  const expires = limits.expiresAt ? new Date(limits.expiresAt).toLocaleDateString() : null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" aria-label="Plan limits and usage">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900">Plan & Usage</h2>
          <p className="text-sm text-slate-600" aria-live="polite">
            Current plan: <span className="font-medium text-slate-800">{planLabel}</span>
            {expires ? ` - access until ${expires}` : ''}
          </p>
          <p className="text-xs text-slate-500" aria-live="polite">
            Per-minute limits: {limits.generation.rateLimit} tailored CVs - {limits.optimization.rateLimit} optimizations
          </p>
          {limits.plan === 'free' && !freeDefaultsApplied && (
            <p className="text-xs font-medium text-amber-600" role="status">
              Free plan limits differ from the latest defaults. Select &quot;Switch to Free&quot; to resync.
            </p>
          )}
          {!limits.allowExport && (
            <p className="text-xs font-medium text-amber-600">Exports are disabled on this plan.</p>
          )}
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <div className="flex gap-2">
            <form action={setFreePlan}>
              <button
                type="submit"
                className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={limits.plan === 'free' && freeDefaultsApplied}
                aria-disabled={limits.plan === 'free' && freeDefaultsApplied}
              >
                Switch to Free
              </button>
            </form>
            <form action={setProPlan}>
              <button
                type="submit"
                className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={limits.plan === 'pro'}
                aria-disabled={limits.plan === 'pro'}
              >
                Switch to Pro
              </button>
            </form>
          </div>
          <p className="text-[11px] text-slate-500">(Dev helper - replace with Stripe flow later)</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2" role="list">
        <UsageBar label="Tailored CVs this month" used={generationUsed} limit={limits.generation.monthlyLimit} />
        <UsageBar label="Reference optimizations this month" used={optimizationUsed} limit={limits.optimization.monthlyLimit} />
      </div>
    </section>
  );
}
