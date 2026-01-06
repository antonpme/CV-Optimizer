import type { SupabaseTypedClient } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type CreditTransactionType = 'spend' | 'topup' | 'refund' | 'grant' | 'adjust';
export type RunType = Database['public']['Tables']['ai_runs']['Row']['run_type'];

const VALID_TRANSACTION_TYPES: Set<CreditTransactionType> = new Set([
  'spend',
  'topup',
  'refund',
  'grant',
  'adjust',
]);

function sanitizeAmount(amount: number): number {
  if (!Number.isFinite(amount)) {
    return 0;
  }
  return Math.max(0, Math.trunc(amount));
}

function getMonthStartIso(reference = new Date()): string {
  const start = new Date(reference);
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  return start.toISOString();
}

async function ensureBalanceRow(client: SupabaseTypedClient, userId: string): Promise<number> {
  const { data, error } = await client.rpc('add_credits', { p_user_id: userId, p_amount: 0 });
  if (error) throw new Error(error.message);
  const balance = typeof data === 'number' ? data : 0;
  return balance;
}

export async function getCreditBalance(client: SupabaseTypedClient, userId: string): Promise<number> {
  const { data, error } = await client
    .from('user_balances')
    .select('credits')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return ensureBalanceRow(client, userId);
  }

  return typeof data.credits === 'number' ? data.credits : 0;
}

type SpendParams = {
  client: SupabaseTypedClient;
  userId: string;
  amount: number;
  type?: CreditTransactionType;
  referenceId?: string | null;
  note?: string | null;
};

export async function spendCredits({ client, userId, amount, type = 'spend', referenceId = null, note = null }: SpendParams) {
  const creditsToSpend = sanitizeAmount(amount);
  if (creditsToSpend <= 0) {
    const balance = await getCreditBalance(client, userId);
    return { ok: true as const, balance, transactionId: null };
  }

  const { data, error } = await client.rpc('spend_credits', {
    p_user_id: userId,
    p_amount: creditsToSpend,
  });

  if (error) {
    return { ok: false as const, error: error.message };
  }

  if (data === null) {
    return { ok: false as const, error: 'Insufficient credits.' };
  }

  const transactionType = VALID_TRANSACTION_TYPES.has(type) ? type : 'spend';
  const { data: transaction, error: txError } = await client
    .from('credit_transactions')
    .insert({
      user_id: userId,
      delta_credits: -creditsToSpend,
      type: transactionType,
      reference_id: referenceId,
      note,
    })
    .select('id')
    .single();

  if (txError) {
    return { ok: false as const, error: txError.message };
  }

  const balance = typeof data === 'number' ? data : 0;
  return { ok: true as const, balance, transactionId: transaction?.id ?? null };
}

type AddParams = {
  client: SupabaseTypedClient;
  userId: string;
  amount: number;
  type?: CreditTransactionType;
  referenceId?: string | null;
  note?: string | null;
};

export async function addCredits({ client, userId, amount, type = 'topup', referenceId = null, note = null }: AddParams) {
  const creditsToAdd = sanitizeAmount(amount);
  if (creditsToAdd <= 0) {
    const balance = await getCreditBalance(client, userId);
    return { ok: true as const, balance, transactionId: null };
  }

  const { data, error } = await client.rpc('add_credits', {
    p_user_id: userId,
    p_amount: creditsToAdd,
  });

  if (error) {
    return { ok: false as const, error: error.message };
  }

  const transactionType = VALID_TRANSACTION_TYPES.has(type) ? type : 'topup';
  const { data: transaction, error: txError } = await client
    .from('credit_transactions')
    .insert({
      user_id: userId,
      delta_credits: creditsToAdd,
      type: transactionType,
      reference_id: referenceId,
      note,
    })
    .select('id')
    .single();

  if (txError) {
    return { ok: false as const, error: txError.message };
  }

  const balance = typeof data === 'number' ? data : creditsToAdd;
  return { ok: true as const, balance, transactionId: transaction?.id ?? null };
}

export async function refundCredits(params: AddParams) {
  return addCredits({ ...params, type: 'refund' });
}

type UsageSummary = {
  used: number;
  remaining: number;
  limit: number;
};

export async function getMonthlyUsageSummary(
  client: SupabaseTypedClient,
  userId: string,
  runType: RunType,
  monthlyLimit: number,
  referenceDate?: Date,
): Promise<UsageSummary> {
  const limit = Math.max(0, monthlyLimit);
  if (limit === 0) {
    return { used: 0, remaining: Number.POSITIVE_INFINITY, limit };
  }

  const sinceIso = getMonthStartIso(referenceDate);
  const { count, error } = await client
    .from('ai_runs')
    .select('id', { head: true, count: 'exact' })
    .eq('user_id', userId)
    .eq('run_type', runType)
    .eq('status', 'success')
    .gte('created_at', sinceIso);

  if (error) {
    throw new Error(error.message);
  }

  const used = count ?? 0;
  const remaining = Math.max(0, limit - used);
  return { used, remaining, limit };
}

export { getMonthStartIso };
