import type { SupabaseTypedClient } from "@/lib/supabase";

export type DashboardStats = {
  creditsBalance: number;
  cvsOptimized: number;
  cvsGenerated: number;
  creditsUsed: number;
  totalSpentUsd: number;
};

export type ActivityItem = {
  id: string;
  deltaCredits: number;
  type: "spend" | "topup" | "refund" | "grant" | "adjust";
  note: string | null;
  createdAt: string;
};

export async function getDashboardStats(
  client: SupabaseTypedClient,
  userId: string
): Promise<DashboardStats> {
  // Get credits balance
  const { data: balanceData } = await client
    .from("user_balances")
    .select("credits")
    .eq("user_id", userId)
    .maybeSingle();

  const creditsBalance = balanceData?.credits ?? 0;

  // Get CVs optimized count
  const { count: optimizedCount } = await client
    .from("ai_runs")
    .select("id", { head: true, count: "exact" })
    .eq("user_id", userId)
    .eq("run_type", "optimize_cv")
    .eq("status", "success");

  // Get CVs generated count
  const { count: generatedCount } = await client
    .from("ai_runs")
    .select("id", { head: true, count: "exact" })
    .eq("user_id", userId)
    .eq("run_type", "generate_tailored_cv")
    .eq("status", "success");

  // Get total credits used (sum of negative transactions)
  const { data: spendData } = await client
    .from("credit_transactions")
    .select("delta_credits")
    .eq("user_id", userId)
    .lt("delta_credits", 0);

  const creditsUsed = spendData
    ? spendData.reduce((sum, tx) => sum + Math.abs(tx.delta_credits), 0)
    : 0;

  // Get total spent in USD (sum of positive transactions from topups)
  const { data: topupData } = await client
    .from("credit_transactions")
    .select("delta_credits")
    .eq("user_id", userId)
    .eq("type", "topup")
    .gt("delta_credits", 0);

  // Assuming 100 credits = $1 (from PRICING.credit.creditsPerUsd)
  const totalCreditsTopup = topupData
    ? topupData.reduce((sum, tx) => sum + tx.delta_credits, 0)
    : 0;
  const totalSpentUsd = totalCreditsTopup / 100;

  return {
    creditsBalance,
    cvsOptimized: optimizedCount ?? 0,
    cvsGenerated: generatedCount ?? 0,
    creditsUsed,
    totalSpentUsd,
  };
}

export async function getRecentActivity(
  client: SupabaseTypedClient,
  userId: string,
  limit = 5
): Promise<ActivityItem[]> {
  const { data, error } = await client
    .from("credit_transactions")
    .select("id, delta_credits, type, note, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data.map((tx) => ({
    id: tx.id,
    deltaCredits: tx.delta_credits,
    type: tx.type as ActivityItem["type"],
    note: tx.note,
    createdAt: tx.created_at ?? new Date().toISOString(),
  }));
}
