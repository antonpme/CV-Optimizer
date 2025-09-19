import Link from 'next/link';
import { createClientForServerComponent } from '@/lib/supabase';
import { SignInForm } from '@/components/auth/sign-in-form';
import { SignOutForm } from '@/components/auth/sign-out-form';

export default async function Home() {
  const supabase = createClientForServerComponent();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
      <main className="flex min-h-screen flex-col items-center bg-slate-50 py-24">
        <div className="w-full max-w-xl space-y-8 px-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-slate-900">
              AI-powered CV optimization
            </h1>
            <p className="text-slate-600">
              Sign in with your email to access the dashboard and start optimizing your CVs.
            </p>
          </div>

          {session ? (
            <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-700">
                Signed in as{' '}
                <span className="font-semibold">{session.user.email}</span>.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/app"
                  className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                >
                  Go to dashboard
                </Link>
                <SignOutForm />
              </div>
            </div>
          ) : (
            <SignInForm />
          )}

          <p className="text-xs text-slate-500">
            Magic links expire in five minutes. Make sure to open the email on this device.
          </p>
        </div>
      </main>
  );
}
