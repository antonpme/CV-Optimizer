import { createClientForServerComponent } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { ProfileForm } from './profile-form';
import { CvSection } from './cv-section';
import { PlanUsageCard } from '@/components/app/plan-usage-card';
import { CostSummaryCard } from '@/components/app/cost-summary-card';
import { PLAN_PRESETS } from '@/lib/plan-presets';
import { ReferenceCvPanel } from './reference-cv-panel';
import { JobSection } from '@/components/app/job-section';
import { GeneratedCvSection } from '@/components/app/generated-cv-section';
import { getUserLimits } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

type SectionRow = Database['public']['Tables']['generated_cv_sections']['Row'];
type ExportRow = Database['public']['Tables']['cv_exports']['Row'];
type AiRunRow = Database['public']['Tables']['ai_runs']['Row'];

type SectionsByCv = Record<string, SectionRow[]>;
type ExportsByCv = Record<string, ExportRow[]>;

function groupSections(sections: SectionRow[] | null | undefined): SectionsByCv {
  if (!sections) {
    return {};
  }
  return sections.reduce<SectionsByCv>((acc, section) => {
    if (!acc[section.generated_cv_id]) {
      acc[section.generated_cv_id] = [];
    }
    acc[section.generated_cv_id].push(section);
    return acc;
  }, {});
}

function groupExports(exportsList: ExportRow[] | null | undefined): ExportsByCv {
  if (!exportsList) {
    return {};
  }
  return exportsList.reduce<ExportsByCv>((acc, item) => {
    if (!acc[item.generated_cv_id]) {
      acc[item.generated_cv_id] = [];
    }
    acc[item.generated_cv_id].push(item);
    return acc;
  }, {});
}

export default async function AppHome() {
  const supabase = createClientForServerComponent();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return null;
  }

  const freePreset = PLAN_PRESETS.free;
  const { data: entitlement } = await supabase
    .from('user_entitlements')
    .select('plan, gen_rate_limit, gen_window_seconds, gen_monthly_limit, opt_rate_limit, opt_window_seconds, opt_monthly_limit, allow_export')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (!entitlement) {
    const { error } = await supabase
      .from('user_entitlements')
      .insert({
        user_id: session.user.id,
        ...freePreset,
        expires_at: null,
      });

    if (error) {
      logger.error('Provisioning free plan failed', { error: error.message, userId: session.user.id });
    } else {
      logger.info('Provisioned free plan defaults', { userId: session.user.id });
    }
  } else if (entitlement.plan === 'free') {
    const needsSync =
      entitlement.gen_rate_limit !== freePreset.gen_rate_limit ||
      entitlement.gen_window_seconds !== freePreset.gen_window_seconds ||
      entitlement.gen_monthly_limit !== freePreset.gen_monthly_limit ||
      entitlement.opt_rate_limit !== freePreset.opt_rate_limit ||
      entitlement.opt_window_seconds !== freePreset.opt_window_seconds ||
      entitlement.opt_monthly_limit !== freePreset.opt_monthly_limit ||
      (entitlement.allow_export ?? freePreset.allow_export) !== freePreset.allow_export;

    if (needsSync) {
      const { error } = await supabase
        .from('user_entitlements')
        .update({
          ...freePreset,
          updated_at: new Date().toISOString(),
          expires_at: null,
        })
        .eq('user_id', session.user.id);

      if (error) {
        logger.error('Resyncing free plan defaults failed', { error: error.message, userId: session.user.id });
      } else {
        logger.info('Resynced free plan defaults', { userId: session.user.id });
      }
    }
  }

  const limits = await getUserLimits(supabase, session.user.id);

  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);
  const startOfMonthIso = startOfMonth.toISOString();

  const { count: generationUsageCount } = await supabase
    .from('ai_runs')
    .select('id', { head: true, count: 'exact' })
    .eq('user_id', session.user.id)
    .eq('run_type', 'cv_generation')
    .eq('status', 'success')
    .gte('created_at', startOfMonthIso);

  const { count: optimizationUsageCount } = await supabase
    .from('ai_runs')
    .select('id', { head: true, count: 'exact' })
    .eq('user_id', session.user.id)
    .eq('run_type', 'optimize_cv')
    .eq('status', 'success')
    .gte('created_at', startOfMonthIso);

  const generationUsed = generationUsageCount ?? 0;
  const optimizationUsed = optimizationUsageCount ?? 0;

  const { data: costRows } = await supabase
    .from('ai_runs')
    .select('run_type, cost_usd')
    .eq('user_id', session.user.id)
    .eq('status', 'success')
    .gte('created_at', startOfMonthIso);

  const costSummary = (costRows ?? []).reduce(
    (acc, row) => {
      const raw = (row as Partial<AiRunRow>).cost_usd;
      const cost = typeof raw === 'number' ? raw : Number.parseFloat(raw ?? '0');
      if (Number.isFinite(cost)) {
        acc.total += cost;
        if (row.run_type === 'cv_generation') {
          acc.generation += cost;
        } else if (row.run_type === 'optimize_cv') {
          acc.optimization += cost;
        }
      }
      return acc;
    },
    { total: 0, generation: 0, optimization: 0 },
  );

  const costTotals = {
    total: Number(costSummary.total.toFixed(2)),
    generation: Number(costSummary.generation.toFixed(2)),
    optimization: Number(costSummary.optimization.toFixed(2)),
  };

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  const { data: cvs } = await supabase
    .from('cvs')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  const formKey = profile?.updated_at ?? 'new-profile';
  const referenceCv = cvs?.find((cv) => cv.is_reference);

  let latestOptimization: Database['public']['Tables']['optimized_cvs']['Row'] | null = null;
  if (referenceCv) {
    const { data: optimized } = await supabase
      .from('optimized_cvs')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('cv_id', referenceCv.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    latestOptimization = optimized ?? null;
  }

  const { data: jobDescriptions } = await supabase
    .from('job_descriptions')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  const { data: generatedCvs } = await supabase
    .from('generated_cvs')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  const { data: generatedSections } = await supabase
    .from('generated_cv_sections')
    .select('*')
    .eq('user_id', session.user.id)
    .order('ordering', { ascending: true });

  const { data: exportHistory } = await supabase
    .from('cv_exports')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(100);

  const sectionsByCv = groupSections(generatedSections);
  const exportsByCv = groupExports(exportHistory);

  return (
    <main id="main-content" tabIndex={-1} className="space-y-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Your Profile</h1>
        <p className="text-sm text-slate-600">
          Keep this information current so AI optimizations stay accurate.
        </p>
      </div>
      <PlanUsageCard
        limits={limits}
        generationUsed={generationUsed}
        optimizationUsed={optimizationUsed}
      />
      <CostSummaryCard
        total={costTotals.total}
        generation={costTotals.generation}
        optimization={costTotals.optimization}
      />
      <ProfileForm key={formKey} initial={profile ?? null} />

      <ReferenceCvPanel
        referenceCv={referenceCv ?? null}
        latestOptimization={latestOptimization}
        defaultLevel={profile?.embellishment_level ?? 3}
      />

      <div id="cv-library" className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">CV Library</h2>
        <CvSection cvs={cvs ?? []} />
      </div>

      <JobSection jobs={jobDescriptions ?? []} hasReferenceCv={!!referenceCv} />

      <GeneratedCvSection
        generated={generatedCvs ?? []}
        jobs={jobDescriptions ?? []}
        sectionsByCv={sectionsByCv}
        exportsByCv={exportsByCv}
        allowExport={limits.allowExport}
      />
    </main>
  );
}
