import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { createClientForServerComponent } from '@/lib/supabase';
import { AppShell } from '@/components/layout';

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClientForServerComponent();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/');
  }

  const email = session.user.email ?? '';

  return <AppShell email={email}>{children}</AppShell>;
}
