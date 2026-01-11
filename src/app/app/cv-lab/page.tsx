import { createClientForServerComponent } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { CvSection } from '../cv-section';
import { ReferenceCvPanel } from '../reference-cv-panel';

export const dynamic = 'force-dynamic';

export default async function CvLabPage() {
  const supabase = await createClientForServerComponent();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return null;
  }

  // Fetch profile for embellishment level default
  const { data: profile } = await supabase
    .from('profiles')
    .select('embellishment_level')
    .eq('user_id', session.user.id)
    .single();

  // Fetch all CVs
  const { data: cvs } = await supabase
    .from('cvs')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  const referenceCv = cvs?.find((cv) => cv.is_reference);

  // Fetch latest optimization for reference CV
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

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">CV Lab</h1>
        <p className="text-sm text-slate-600">
          Upload your CV, create a Master CV, and generate tailored versions for specific jobs.
        </p>
      </div>

      {/* Reference CV Panel - Master CV Section */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900">Master CV</h2>
          <p className="text-sm text-slate-600">
            Your optimized reference CV. This serves as the base for all tailored versions.
          </p>
        </div>
        <ReferenceCvPanel
          referenceCv={referenceCv ?? null}
          latestOptimization={latestOptimization}
          defaultLevel={profile?.embellishment_level ?? 3}
        />
      </section>

      {/* CV Library */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900">CV Library</h2>
          <p className="text-sm text-slate-600">
            Upload and manage your CVs. Mark one as reference to enable AI optimization.
          </p>
        </div>
        <CvSection cvs={cvs ?? []} />
      </section>
    </div>
  );
}
