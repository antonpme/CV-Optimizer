import { z } from 'zod';

const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';

export const optimizationSchema = z.object({
  optimized_cv: z.string().min(1),
  changes_summary: z
    .array(
      z.object({
        section: z.string(),
        change: z.string(),
        confidence: z.number().min(0).max(1).optional(),
      }),
    )
    .default([]),
  overall_confidence: z.number().min(0).max(1).optional(),
  recommendations: z.array(z.string()).default([]),
});

export type OptimizationResult = z.infer<typeof optimizationSchema>;

type OpenAIUsage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
};

export async function callCvOptimization({
  model,
  cvText,
  profile,
  embellishmentLevel,
}: {
  model: string;
  cvText: string;
  profile: {
    full_name?: string | null;
    job_title?: string | null;
    professional_summary?: string | null;
    industry?: string | null;
    embellishment_level?: number | null;
  };
  embellishmentLevel: number;
}): Promise<{ result: OptimizationResult; usage?: OpenAIUsage }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const systemPrompt = `You are an expert CV optimizer. Respond ONLY with JSON matching the provided schema.`;

  const profileSummary = `Full name: ${profile.full_name ?? 'N/A'}\nJob title: ${profile.job_title ?? 'N/A'}\nIndustry: ${profile.industry ?? 'N/A'}\nProfessional summary: ${profile.professional_summary ?? 'N/A'}\nPreferred embellishment level: ${profile.embellishment_level ?? 'Not specified'}`;

  const userPrompt = `Optimize the following CV content while obeying these rules:
- Preserve factual accuracy. Do NOT invent employers, dates, or certifications.
- Use the embellishment level (1-5) to control assertiveness. Higher means more confident phrasing, but still truthful.
- Highlight quantifiable achievements when present.
- Maintain or improve ATS-friendly formatting.
- Provide a brief change summary per section.

Embellishment level requested: ${embellishmentLevel}

Candidate profile:
${profileSummary}

Raw CV content:
"""
${cvText}
"""

Respond with JSON like:
{
  "optimized_cv": "...",
  "changes_summary": [
    { "section": "Experience", "change": "Added metrics to project X", "confidence": 0.9 }
  ],
  "overall_confidence": 0.85,
  "recommendations": ["Optional improvements"]
}`;

  const response = await fetch(OPENAI_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const messageContent: string | null = data?.choices?.[0]?.message?.content ?? null;
  if (!messageContent) {
    throw new Error('OpenAI response missing content');
  }

  const parsed = optimizationSchema.safeParse(JSON.parse(messageContent));
  if (!parsed.success) {
    throw new Error(`OpenAI response could not be parsed: ${parsed.error.message}`);
  }

  const usage: OpenAIUsage | undefined = data?.usage;

  return {
    result: parsed.data,
    usage,
  };
}

