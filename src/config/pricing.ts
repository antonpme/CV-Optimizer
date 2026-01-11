export const PRICING = {
  version: '2025-10-01',
  credit: {
    label: 'credits',
    decimals: 0,
    creditsPerUsd: 100,
  },
  models: {
    'gpt-4o-mini': {
      usdPerKInput: 0.0005,
      usdPerKOutput: 0.0015,
    },
  },
  features: {
    optimize_cv: {
      baseCredits: 15,
      perKInputTokens: 0,
      perKOutputTokens: 0,
      defaultUsage: { inputTokens: 800, outputTokens: 600 },
    },
    cv_generation: {
      baseCredits: 25,
      perKInputTokens: 0,
      perKOutputTokens: 0,
      defaultUsage: { inputTokens: 1200, outputTokens: 900 },
    },
    export_docx: {
      baseCredits: 2,
    },
  },
  multipliers: {
    overhead: 1.15,
    minimumCharge: 5,
  },
  free: {
    monthlyRuns: 3,
  },
  bundles: [
    { id: 'starter', credits: 500, displayName: 'Starter (500 credits)', priceUsd: 5 },
    { id: 'growth', credits: 2000, displayName: 'Growth (2,000 credits)', priceUsd: 18 },
  ],
} as const;

export type PricingConfig = typeof PRICING;
export type PricingRunType = keyof PricingConfig['features'];
export type PricingModelKey = keyof PricingConfig['models'];
