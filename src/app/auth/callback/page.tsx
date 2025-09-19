import { redirect } from 'next/navigation';
import { createClientForServerComponent } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function AuthCallback(
  props: { searchParams?: Record<string, string | string[]> }
) {
  const supabase = createClientForServerComponent();
  const search = props.searchParams ?? {};
  const code = (search.code ?? '') as string;
  const next = (search.next ?? '/') as string;

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  redirect(next || '/');
}

