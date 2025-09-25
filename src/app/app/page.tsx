import { createClientForServerComponent } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { ProfileForm } from './profile-form';
import { CvSection } from './cv-section';
import { ReferenceCvPanel } from './reference-cv-panel';
import { JobSection } from '@/components/app/job-section';
import { GeneratedCvSection } from '@/components/app/generated-cv-section';

export const dynamic = 'force-dynamic';

type SectionRow = Database['public']['Tables']['generated_cv_sections']['Row'];
type ExportRow = Database['public']['Tables']['cv_exports']['Row'];

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
    <div className="space-y-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Your Profile</h1>
        <p className="text-sm text-slate-600">
          Keep this information current so AI optimizations stay accurate.
        </p>
      </div>
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
      />
    </div>
  );
}
