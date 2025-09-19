import { createClientForServerComponent } from '@/lib/supabase';
import { ProfileForm } from './profile-form';
import { CvSection } from './cv-section';

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

  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Your Profile</h1>
        <p className="text-sm text-slate-600">
          Keep this information current so AI optimizations stay accurate.
        </p>
      </div>
      <ProfileForm key={formKey} initial={profile ?? null} />

      <CvSection cvs={cvs ?? []} />
    </div>
  );
}
