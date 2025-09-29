import { Ratelimit } from "@upstash/ratelimit";
import type { Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { SupabaseTypedClient } from "@/lib/supabase";
import type { Database } from "@/types/database";

type RateLimitOutcome = { ok: true } | { ok: false; message: string };

type QuotaOutcome = { ok: true; remaining: number } | { ok: false; message: string };

type QuotaParams = {
  supabase: SupabaseTypedClient;
  userId: string;
  runType: "cv_generation" | "optimize_cv";
  limit: number;
  pending?: number;
  label: string;
};

type RateConfig = {
  rateLimit: number;
  windowSeconds: number;
  monthlyLimit: number;
};

export type UserLimits = {
  plan: string;
  generation: RateConfig;
  optimization: RateConfig;
  allowExport: boolean;
  expiresAt: string | null;
};

type UserEntitlementRow = Database["public"]["Tables"]["user_entitlements"]["Row"];

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

function parseWindowString(value: string | undefined, fallback: string): string {
  if (!value || !value.trim()) return fallback;
  return value;
}

function parseWindowToSeconds(value: string | undefined, fallbackSeconds: number): number {
  if (!value || !value.trim()) return fallbackSeconds;
  const trimmed = value.trim().toLowerCase();
  const minutes = trimmed.match(/^(\d+)\s*m/);
  if (minutes) return Math.max(1, parseInt(minutes[1], 10)) * 60;
  const seconds = trimmed.match(/^(\d+)\s*s?/);
  if (seconds) return Math.max(1, parseInt(seconds[1], 10));
  return fallbackSeconds;
}

function parseIntOrFallback(value: number | null | undefined, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  return fallback;
}

function getEnvDefaults(): UserLimits {
  const generationRate = Number.parseInt(process.env.CV_GENERATION_RATE_LIMIT ?? "5", 10);
  const generationWindowSeconds = parseWindowToSeconds(process.env.CV_GENERATION_RATE_WINDOW, 60);
  const generationMonthly = Number.parseInt(process.env.CV_GENERATION_MONTHLY_LIMIT ?? "50", 10);

  const optimizationRate = Number.parseInt(process.env.CV_OPTIMIZE_RATE_LIMIT ?? "8", 10);
  const optimizationWindowSeconds = parseWindowToSeconds(process.env.CV_OPTIMIZE_RATE_WINDOW, 60);
  const optimizationMonthly = Number.parseInt(process.env.CV_OPTIMIZE_MONTHLY_LIMIT ?? "30", 10);

  return {
    plan: "free",
    generation: {
      rateLimit: generationRate,
      windowSeconds: generationWindowSeconds,
      monthlyLimit: generationMonthly,
    },
    optimization: {
      rateLimit: optimizationRate,
      windowSeconds: optimizationWindowSeconds,
      monthlyLimit: optimizationMonthly,
    },
    allowExport: true,
    expiresAt: null,
  };
}

const envDefaults = getEnvDefaults();

const generationLimiter = createLimiter(
  "cv-generation",
  envDefaults.generation.rateLimit,
  parseWindowString(process.env.CV_GENERATION_RATE_WINDOW, "1 m"),
);

const optimizationLimiter = createLimiter(
  "cv-optimization",
  envDefaults.optimization.rateLimit,
  parseWindowString(process.env.CV_OPTIMIZE_RATE_WINDOW, "1 m"),
);

function createLimiter(prefix: string, limit: number, window: string) {
  if (!redis || !limit || limit <= 0) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(limit, window as Duration),
    analytics: true,
    prefix,
  });
}

function friendlyWaitMessage(reset?: number) {
  if (!reset) {
    return "Too many requests. Please wait a moment before trying again.";
  }

  const resetMs = reset > 10_000_000_000 ? reset : reset * 1000;
  const msRemaining = Math.max(0, resetMs - Date.now());
  const seconds = Math.max(1, Math.ceil(msRemaining / 1000));

  if (seconds < 60) {
    return `Please wait ${seconds} seconds before trying again.`;
  }

  const minutes = Math.ceil(seconds / 60);
  return `Please wait about ${minutes} minute${minutes === 1 ? "" : "s"} before trying again.`;
}

export async function getUserLimits(
  supabase: SupabaseTypedClient,
  userId: string,
): Promise<UserLimits> {
  const defaults = envDefaults;
  const { data: row } = await supabase
    .from('user_entitlements')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle<UserEntitlementRow>();

  if (!row) {
    return defaults;
  }

  return {
    plan: row.plan ?? defaults.plan,
    generation: {
      rateLimit: parseIntOrFallback(row.gen_rate_limit, defaults.generation.rateLimit),
      windowSeconds: parseIntOrFallback(row.gen_window_seconds, defaults.generation.windowSeconds),
      monthlyLimit: parseIntOrFallback(row.gen_monthly_limit, defaults.generation.monthlyLimit),
    },
    optimization: {
      rateLimit: parseIntOrFallback(row.opt_rate_limit, defaults.optimization.rateLimit),
      windowSeconds: parseIntOrFallback(row.opt_window_seconds, defaults.optimization.windowSeconds),
      monthlyLimit: parseIntOrFallback(row.opt_monthly_limit, defaults.optimization.monthlyLimit),
    },
    allowExport: row.allow_export ?? defaults.allowExport,
    expiresAt: row.expires_at ?? null,
  };
}

export async function enforceCvGenerationRateLimit(
  userId: string,
  supabase?: SupabaseTypedClient,
  limits?: UserLimits,
): Promise<RateLimitOutcome> {
  const defaults = envDefaults;
  let config = defaults.generation;
  let allowUpstash = true;
  let resolvedLimits = limits;

  if (!resolvedLimits && supabase) {
    resolvedLimits = await getUserLimits(supabase, userId);
  }

  if (resolvedLimits) {
    config = resolvedLimits.generation;
    allowUpstash =
      config.rateLimit === defaults.generation.rateLimit &&
      config.windowSeconds === defaults.generation.windowSeconds;
  }

  if (config.rateLimit <= 0) {
    return { ok: true };
  }

  if (generationLimiter && allowUpstash) {
    const result = await generationLimiter.limit(userId);
    if (result.success) {
      return { ok: true };
    }
    return { ok: false, message: friendlyWaitMessage(result.reset) };
  }

  if (supabase) {
    return dbWindowCheck({
      supabase,
      userId,
      runType: "cv_generation",
      limit: config.rateLimit,
      windowSeconds: config.windowSeconds,
      label: "generations",
    });
  }

  return { ok: true };
}

export async function enforceCvOptimizationRateLimit(
  userId: string,
  supabase?: SupabaseTypedClient,
  limits?: UserLimits,
): Promise<RateLimitOutcome> {
  const defaults = envDefaults;
  let config = defaults.optimization;
  let allowUpstash = true;
  let resolvedLimits = limits;

  if (!resolvedLimits && supabase) {
    resolvedLimits = await getUserLimits(supabase, userId);
  }

  if (resolvedLimits) {
    config = resolvedLimits.optimization;
    allowUpstash =
      config.rateLimit === defaults.optimization.rateLimit &&
      config.windowSeconds === defaults.optimization.windowSeconds;
  }

  if (config.rateLimit <= 0) {
    return { ok: true };
  }

  if (optimizationLimiter && allowUpstash) {
    const result = await optimizationLimiter.limit(userId);
    if (result.success) {
      return { ok: true };
    }
    return { ok: false, message: friendlyWaitMessage(result.reset) };
  }

  if (supabase) {
    return dbWindowCheck({
      supabase,
      userId,
      runType: "optimize_cv",
      limit: config.rateLimit,
      windowSeconds: config.windowSeconds,
      label: "optimizations",
    });
  }

  return { ok: true };
}

export async function enforceMonthlyQuota({
  supabase,
  userId,
  runType,
  limit,
  pending = 0,
  label,
}: QuotaParams): Promise<QuotaOutcome> {
  if (!limit || limit <= 0) {
    return { ok: true, remaining: Number.POSITIVE_INFINITY };
  }

  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("ai_runs")
    .select("id", { head: true, count: "exact" })
    .eq("user_id", userId)
    .eq("run_type", runType)
    .eq("status", "success")
    .gte("created_at", startOfMonth.toISOString());

  const used = count ?? 0;
  const projected = used + pending;

  if (projected > limit) {
    const remaining = Math.max(0, limit - used);
    return {
      ok: false,
      message: remaining > 0
        ? `You have ${remaining} ${label} left this month. Reduce your selection or wait until the next cycle.`
        : `Monthly ${label} limit reached. Upgrade your plan or wait until the next cycle.`,
    };
  }

  return { ok: true, remaining: limit - projected };
}

async function dbWindowCheck(params: {
  supabase: SupabaseTypedClient;
  userId: string;
  runType: "cv_generation" | "optimize_cv";
  limit: number;
  windowSeconds: number;
  label: string;
}): Promise<RateLimitOutcome> {
  const { supabase, userId, runType, limit, windowSeconds, label } = params;
  const since = new Date(Date.now() - windowSeconds * 1000).toISOString();
  const { count } = await supabase
    .from("ai_runs")
    .select("id", { head: true, count: "exact" })
    .eq("user_id", userId)
    .eq("run_type", runType)
    .eq("status", "success")
    .gte("created_at", since);

  const used = count ?? 0;
  if (used >= limit) {
    return { ok: false, message: `Please wait a bit before more ${label}.` };
  }

  return { ok: true };
}
