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

export const tailoredSchema = z.object({
  tailored_cv: z.string().min(1),
  match_analysis: z
    .object({
      overall_match_score: z.number().min(0).max(1).optional(),
      key_matches: z
        .array(
          z.object({
            requirement: z.string(),
            candidate_fit: z.string(),
            confidence: z.number().min(0).max(1).optional(),
          }),
        )
        .default([]),
      gaps_identified: z
        .array(
          z.object({
            gap: z.string(),
            mitigation: z.string(),
          }),
        )
        .default([]),
    })
    .nullable()
    .optional(),
  optimization_notes: z
    .object({
      sections_enhanced: z.array(z.string()).default([]),
      keywords_added: z.array(z.string()).default([]),
      achievements_highlighted: z.array(z.string()).default([]),
    })
    .nullable()
    .optional(),
});

export type TailoredResult = z.infer<typeof tailoredSchema>;

export async function callTailoredCv({
  model,
  referenceCv,
  jobDescription,
  profile,
  embellishmentLevel,
}: {
  model: string;
  referenceCv: string;
  jobDescription: {
    title?: string | null;
    company?: string | null;
    text_content: string;
  };
  profile: {
    full_name?: string | null;
    job_title?: string | null;
    professional_summary?: string | null;
    industry?: string | null;
  };
  embellishmentLevel: number;
}): Promise<{ result: TailoredResult; usage?: OpenAIUsage }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const systemPrompt = `You are an expert resume writer specialising in tailoring CVs to specific job descriptions. Return only JSON matching the requested schema.`;

  const userPrompt = `Tailor the candidate's CV for the job below while keeping all statements truthful. Avoid inventing employers, dates, certifications, or responsibilities.

Embellishment level: ${embellishmentLevel}

Candidate profile:
Full name: ${profile.full_name ?? 'N/A'}
Job title: ${profile.job_title ?? 'N/A'}
Industry: ${profile.industry ?? 'N/A'}
Professional summary: ${profile.professional_summary ?? 'N/A'}

Job title: ${jobDescription.title ?? 'N/A'}
Company: ${jobDescription.company ?? 'N/A'}
Job description:
"""
${jobDescription.text_content}
"""

Reference CV:
"""
${referenceCv}
"""

Respond in JSON with:
{
  "tailored_cv": "...",
  "match_analysis": {
    "overall_match_score": 0.0-1.0,
    "key_matches": [{"requirement": "...", "candidate_fit": "...", "confidence": 0-1}],
    "gaps_identified": [{"gap": "...", "mitigation": "..."}]
  },
  "optimization_notes": {
    "sections_enhanced": ["Experience"],
    "keywords_added": ["keyword"],
    "achievements_highlighted": ["achievement"]
  }
}`;

  const response = await fetch(OPENAI_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.25,
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

  const parsed = tailoredSchema.safeParse(JSON.parse(messageContent));
  if (!parsed.success) {
    throw new Error(`OpenAI tailored response could not be parsed: ${parsed.error.message}`);
  }

  const usage: OpenAIUsage | undefined = data?.usage;
  return { result: parsed.data, usage };
}
