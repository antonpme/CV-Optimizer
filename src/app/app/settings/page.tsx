import { createClientForServerComponent } from '@/lib/supabase';
import { ProfileForm } from '../profile-form';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = await createClientForServerComponent();
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

  const formKey = profile?.updated_at ?? 'new-profile';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-600">
          Manage your profile and preferences.
        </p>
      </div>

      {/* Profile Section */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900">Your Profile</h2>
          <p className="text-sm text-slate-600">
            Keep this information current so AI optimizations stay accurate.
          </p>
        </div>
        <ProfileForm key={formKey} initial={profile ?? null} />
      </section>
    </div>
  );
}
