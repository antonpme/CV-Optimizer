import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { SupabaseTypedClient } from "@/lib/supabase";

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

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

const parseWindow = (value: string | undefined, fallback: string) => {
  if (!value || !value.trim()) return fallback;
  return value;
};

const createLimiter = (prefix: string, limit: number, window: string) => {
  if (!redis || !limit || limit <= 0) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(limit, window),
    analytics: true,
    prefix,
  });
};

const generationLimiter = createLimiter(
  "cv-generation",
  Number.parseInt(process.env.CV_GENERATION_RATE_LIMIT ?? "5", 10),
  parseWindow(process.env.CV_GENERATION_RATE_WINDOW, "1 m"),
);

const optimizationLimiter = createLimiter(
  "cv-optimization",
  Number.parseInt(process.env.CV_OPTIMIZE_RATE_LIMIT ?? "8", 10),
  parseWindow(process.env.CV_OPTIMIZE_RATE_WINDOW, "1 m"),
);

const friendlyWaitMessage = (reset?: number) => {
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
};

export async function enforceCvGenerationRateLimit(userId: string, supabase?: SupabaseTypedClient): Promise<RateLimitOutcome> {
  if (!generationLimiter) {
  if (supabase) {
    const windowSeconds = parseSeconds(process.env.CV_GENERATION_RATE_WINDOW, 60);
    const limit = Number.parseInt(process.env.CV_GENERATION_RATE_LIMIT ?? '5', 10);
    return dbWindowCheck({ supabase, userId, runType: 'cv_generation', limit, windowSeconds, label: 'generations' });
  }
  return { ok: true };
}

  const result = await generationLimiter.limit(userId);
  if (result.success) {
    return { ok: true };
  }

  return {
    ok: false,
    message: friendlyWaitMessage(result.reset),
  };
}

export async function enforceCvOptimizationRateLimit(userId: string, supabase?: SupabaseTypedClient): Promise<RateLimitOutcome> {
  if (!optimizationLimiter) {
  if (supabase) {
    const windowSeconds = parseSeconds(process.env.CV_OPTIMIZE_RATE_WINDOW, 60);
    const limit = Number.parseInt(process.env.CV_OPTIMIZE_RATE_LIMIT ?? '8', 10);
    return dbWindowCheck({ supabase, userId, runType: 'optimize_cv', limit, windowSeconds, label: 'optimizations' });
  }
  return { ok: true };
}

  const result = await optimizationLimiter.limit(userId);
  if (result.success) {
    return { ok: true };
  }

  return {
    ok: false,
    message: friendlyWaitMessage(result.reset),
  };
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


function parseSeconds(window: string | undefined, fallbackSeconds: number): number {
  if (!window) return fallbackSeconds;
  const t = window.trim().toLowerCase();
  const m = t.match(/^(\d+)\s*m/);
  if (m) return Math.max(1, parseInt(m[1], 10)) * 60;
  const s = t.match(/^(\d+)\s*s?/);
  if (s) return Math.max(1, parseInt(s[1], 10));
  return fallbackSeconds;
}

async function dbWindowCheck(params: {
  supabase: SupabaseTypedClient;
  userId: string;
  runType: 'cv_generation' | 'optimize_cv';
  limit: number;
  windowSeconds: number;
  label: string;
}): Promise<RateLimitOutcome> {
  const { supabase, userId, runType, limit, windowSeconds, label } = params;
  if (limit <= 0) return { ok: true };
  const since = new Date(Date.now() - windowSeconds * 1000).toISOString();
  const { count } = await supabase
    .from('ai_runs')
    .select('id', { head: true, count: 'exact' })
    .eq('user_id', userId)
    .eq('run_type', runType)
    .eq('status', 'success')
    .gte('created_at', since);
  const used = count ?? 0;
  if (used >= limit) {
    return { ok: false, message: `Please wait a bit before more ${label}.` };
  }
  return { ok: true };
}
