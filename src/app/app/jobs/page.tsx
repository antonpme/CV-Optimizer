import { createClientForServerComponent } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { JobSection } from '@/components/app/job-section';
import { GeneratedCvSection } from '@/components/app/generated-cv-section';

export const dynamic = 'force-dynamic';

type SectionRow = Database['public']['Tables']['generated_cv_sections']['Row'];
type ExportRow = Database['public']['Tables']['cv_exports']['Row'];

type SectionsByCv = Record<string, SectionRow[]>;
type ExportsByCv = Record<string, ExportRow[]>;

function groupSections(sections: SectionRow[] | null | undefined): SectionsByCv {
  if (!sections) return {};
  return sections.reduce<SectionsByCv>((acc, section) => {
    if (!acc[section.generated_cv_id]) {
      acc[section.generated_cv_id] = [];
    }
    acc[section.generated_cv_id].push(section);
    return acc;
  }, {});
}

function groupExports(exportsList: ExportRow[] | null | undefined): ExportsByCv {
  if (!exportsList) return {};
  return exportsList.reduce<ExportsByCv>((acc, item) => {
    if (!acc[item.generated_cv_id]) {
      acc[item.generated_cv_id] = [];
    }
    acc[item.generated_cv_id].push(item);
    return acc;
  }, {});
}

export default async function JobsPage() {
  const supabase = await createClientForServerComponent();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return null;
  }

  // Check if user has a reference CV
  const { data: cvs } = await supabase
    .from('cvs')
    .select('id, is_reference')
    .eq('user_id', session.user.id);

  const hasReferenceCv = cvs?.some((cv) => cv.is_reference) ?? false;

  // Fetch job descriptions
  const { data: jobDescriptions } = await supabase
    .from('job_descriptions')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  // Fetch generated CVs
  const { data: generatedCvs } = await supabase
    .from('generated_cvs')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  // Fetch sections and exports
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

  // Check export permission (simplified - always true for now, will integrate with credits later)
  const allowExport = true;

  const sectionsByCv = groupSections(generatedSections);
  const exportsByCv = groupExports(exportHistory);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Jobs</h1>
        <p className="text-sm text-slate-600">
          Add job descriptions and generate tailored CVs for each position.
        </p>
      </div>

      {/* Job Descriptions Section */}
      <JobSection jobs={jobDescriptions ?? []} hasReferenceCv={hasReferenceCv} />

      {/* Generated CVs Section */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900">Generated CVs</h2>
          <p className="text-sm text-slate-600">
            Tailored CVs generated for your job descriptions. Review, edit, and export.
          </p>
        </div>
        <GeneratedCvSection
          generated={generatedCvs ?? []}
          jobs={jobDescriptions ?? []}
          sectionsByCv={sectionsByCv}
          exportsByCv={exportsByCv}
          allowExport={allowExport}
        />
      </section>
    </div>
  );
}
