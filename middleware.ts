import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/database';

export async function middleware(req: NextRequest) {
  const headersCopy = new Headers(req.headers);
  const requestId = headersCopy.get('x-request-id') ?? crypto.randomUUID();
  headersCopy.set('x-request-id', requestId);

  const res = NextResponse.next({ request: { headers: headersCopy } });
  res.headers.set('x-request-id', requestId);

  // This will refresh the session and set the auth cookie if required.
  const supabase = createMiddlewareClient<Database>({ req, res });
  await supabase.auth.getSession();

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
