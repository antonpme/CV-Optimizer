import { PRICING, type PricingModelKey, type PricingRunType } from '@/config/pricing';

type QuoteOptions = {
  runType: PricingRunType;
  model?: PricingModelKey;
  inputTokens?: number;
  outputTokens?: number;
};

type QuoteBreakdown = {
  baseCredits: number;
  modelCredits: number;
  usageCredits: number;
  overheadApplied: number;
  totalCredits: number;
  tokens: { input: number; output: number };
  priceVersion: string;
};

const DEFAULT_MODEL: PricingModelKey = 'gpt-4o-mini';

function toCredits(usd: number): number {
  return Math.round(usd * PRICING.credit.creditsPerUsd);
}

function applyOverhead(value: number): number {
  const multiplied = value * (PRICING.multipliers.overhead ?? 1);
  const rounded = Math.ceil(multiplied);
  return Math.max(rounded, PRICING.multipliers.minimumCharge ?? 0);
}

export function quoteRun(options: QuoteOptions): QuoteBreakdown {
  const modelKey = options.model ?? DEFAULT_MODEL;
  const modelPricing = PRICING.models[modelKey];
  const feature = PRICING.features[options.runType] as {
    baseCredits: number;
    perKInputTokens?: number;
    perKOutputTokens?: number;
    defaultUsage?: { inputTokens: number; outputTokens: number };
  };

  if (!feature) {
    throw new Error(`Unknown run type: ${options.runType}`);
  }

  const tokensIn = options.inputTokens ?? feature.defaultUsage?.inputTokens ?? 0;
  const tokensOut = options.outputTokens ?? feature.defaultUsage?.outputTokens ?? 0;

  const usdFromModel = modelPricing
    ? (tokensIn / 1000) * modelPricing.usdPerKInput + (tokensOut / 1000) * modelPricing.usdPerKOutput
    : 0;

  const modelCredits = toCredits(usdFromModel);
  const usageCreditsFromFeature = Math.round(
    (feature.perKInputTokens ?? 0) * (tokensIn / 1000) + (feature.perKOutputTokens ?? 0) * (tokensOut / 1000),
  );

  const baseCredits = feature.baseCredits ?? 0;
  const subtotal = baseCredits + modelCredits + usageCreditsFromFeature;
  const totalCredits = applyOverhead(subtotal);

  return {
    baseCredits,
    modelCredits,
    usageCredits: usageCreditsFromFeature,
    overheadApplied: totalCredits - subtotal,
    totalCredits,
    tokens: { input: tokensIn, output: tokensOut },
    priceVersion: PRICING.version,
  };
}

export function getFreeMonthlyAllowance(): number {
  return PRICING.free.monthlyRuns;
}

export function formatCredits(value: number): string {
  const decimals = PRICING.credit.decimals ?? 0;
  const factor = Math.pow(10, decimals);
  const normalized = value / factor;
  return `${normalized.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} credits`;
}
