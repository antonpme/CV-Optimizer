import { redirect } from 'next/navigation';
import { createClientForServerComponent } from '@/lib/supabase';
import { ProfileForm } from './profile-form';

export default async function AppHome() {
  const supabase = createClientForServerComponent();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect('/');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-50 py-16">
      <div className="w-full max-w-2xl space-y-6 px-4">
        <h1 className="text-2xl font-semibold text-slate-900">Your Profile</h1>
        <ProfileForm initial={profile ?? null} />
      </div>
    </main>
  );
}

