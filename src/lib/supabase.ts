import { cookies } from 'next/headers';
import {
  createServerActionClient,
  createServerComponentClient,
  createRouteHandlerClient,
  type SupabaseClient,
} from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

export const createClientForServerComponent = () =>
  createServerComponentClient<Database>({ cookies });

export const createClientForServerAction = () =>
  createServerActionClient<Database>({ cookies });

export const createClientForRouteHandler = () =>
  createRouteHandlerClient<Database>({ cookies });

export type SupabaseTypedClient = SupabaseClient<Database>;
