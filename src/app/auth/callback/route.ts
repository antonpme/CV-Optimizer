import { NextRequest, NextResponse } from 'next/server';
import { createClientForRouteHandler } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';

  if (!code) {
    // Allow direct visits to the route for debugging.
    return NextResponse.redirect(`${requestUrl.origin}/`);
  }

  const supabase = createClientForRouteHandler();
  await supabase.auth.exchangeCodeForSession(code);

  return NextResponse.redirect(`${requestUrl.origin}${next}`);
}
