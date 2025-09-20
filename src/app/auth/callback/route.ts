import { NextRequest, NextResponse } from 'next/server';
import { createClientForRouteHandler } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/';

  const supabase = createClientForRouteHandler();

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    console.log('exchange result', { hasSession: !!data.session, error });
  }

  return NextResponse.redirect(`${url.origin}${next}`);
}
