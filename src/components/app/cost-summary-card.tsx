import type { FC } from 'react';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

type CostSummaryProps = {
  total: number;
  generation: number;
  optimization: number;
};

export const CostSummaryCard: FC<CostSummaryProps> = ({ total, generation, optimization }) => (
  <section
    className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
    aria-label="Monthly AI usage cost"
  >
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">AI Spend This Month</h2>
        <p className="text-sm text-slate-600">
          Tracks successful runs since the start of this billing cycle. Values update as jobs complete.
        </p>
      </div>
      <p className="text-2xl font-semibold text-slate-900" aria-live="polite">
        {currency.format(total)}
      </p>
    </div>

    <dl className="mt-4 grid gap-3 sm:grid-cols-2" aria-live="polite">
      <div className="rounded-md bg-slate-50 p-3">
        <dt className="text-xs uppercase tracking-wide text-slate-500">Tailored CV generation</dt>
        <dd className="text-sm font-medium text-slate-800">{currency.format(generation)}</dd>
      </div>
      <div className="rounded-md bg-slate-50 p-3">
        <dt className="text-xs uppercase tracking-wide text-slate-500">Reference optimisation</dt>
        <dd className="text-sm font-medium text-slate-800">{currency.format(optimization)}</dd>
      </div>
    </dl>
  </section>
);
