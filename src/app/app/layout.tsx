import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { createClientForServerComponent } from '@/lib/supabase';
import { SignOutForm } from '@/components/auth/sign-out-form';

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = createClientForServerComponent();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/');
  }

  const email = session.user.email ?? '';

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/app" className="text-base font-semibold text-slate-900">
            CV Optimizer
          </Link>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            {email && <span className="hidden sm:inline">{email}</span>}
            <SignOutForm variant="ghost" />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        {children}
      </main>
    </div>
  );
}

