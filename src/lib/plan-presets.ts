export const PLAN_PRESETS = {
  free: {
    plan: 'free',
    gen_rate_limit: 3,
    gen_window_seconds: 60,
    gen_monthly_limit: 3,
    opt_rate_limit: 3,
    opt_window_seconds: 60,
    opt_monthly_limit: 3,
    allow_export: true,
  },
  pro: {
    plan: 'pro',
    gen_rate_limit: 15,
    gen_window_seconds: 60,
    gen_monthly_limit: 300,
    opt_rate_limit: 20,
    opt_window_seconds: 60,
    opt_monthly_limit: 120,
    allow_export: true,
  },
} as const;

type PlanPresetKey = keyof typeof PLAN_PRESETS;

type PlanPreset = typeof PLAN_PRESETS[PlanPresetKey];

export type { PlanPreset, PlanPresetKey };
