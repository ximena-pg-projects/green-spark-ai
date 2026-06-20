// lib/detective.ts
// Layer 3 — the LLM detective, running on Google Gemini.
//
// Takes the computed evidence packet (Layers 1-2), asks Gemini to rank impacts
// and choose ROI fixes, and returns strict structured JSON.
//
// ── Why this calls Gemini's REST API directly (no SDK) ───────────────────────
// We force structured output with Gemini's native JSON mode:
//   generationConfig.responseMimeType = "application/json"
//   generationConfig.responseSchema  = <the DetectiveOutput shape>
// This is more reliable than tool/function-calling for a fixed output contract —
// the model is constrained to emit JSON matching the schema, which we then
// re-validate with Zod so a malformed response fails loudly instead of reaching
// the UI. A plain fetch keeps the dependency surface tiny (no provider SDK).
//
// History: this file previously called Claude (via the Anthropic SDK, then via
// CometAPI's OpenAI-compatible proxy). It now uses Gemini. The required env var
// is GEMINI_API_KEY; the model defaults to gemini-2.5-flash and can be overridden
// with GEMINI_MODEL. See git history for the earlier Claude/CometAPI versions.

import { z } from "zod";
import type { DetectiveOutput, EvidencePacket } from "./schema";
import { DETECTIVE_SYSTEM } from "./detectivePrompt";
import { interventionsFor } from "./interventions";
import { rebatesForInterventions } from "./rebates";

const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
const ENDPOINT = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

// ── Runtime validation of the model's structured output ──────────────────────
const RecommendationSchema = z.object({
  action: z.string(),
  estimated_annual_savings: z.string(),
  payback_period: z.string(),
  impact_reduction: z.string(),
});
const TopImpactSchema = z.object({
  category: z.enum(["Energy", "Water", "Waste", "Transportation", "Food"]),
  rank: z.number(),
  impact_score: z.number(),
  detective_insight: z.string(),
  recommendations: z.array(RecommendationSchema),
  quick_win: z.string(),
});
const DetectiveOutputSchema = z.object({
  confidence_level: z.enum(["Low", "Medium", "High"]),
  confidence_explanation: z.string(),
  top_impacts: z.array(TopImpactSchema),
  overall_verdict: z.string(),
});

// ── Gemini responseSchema — same fields as the Zod schema above, expressed in
//    Gemini's OpenAPI-subset dialect (uppercase types, enum on strings). ──────
const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    confidence_level: { type: "STRING", enum: ["Low", "Medium", "High"] },
    confidence_explanation: { type: "STRING" },
    top_impacts: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          category: {
            type: "STRING",
            enum: ["Energy", "Water", "Waste", "Transportation", "Food"],
          },
          rank: { type: "INTEGER" },
          impact_score: { type: "NUMBER" },
          detective_insight: { type: "STRING" },
          recommendations: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                action: { type: "STRING" },
                estimated_annual_savings: { type: "STRING" },
                payback_period: { type: "STRING" },
                impact_reduction: { type: "STRING" },
              },
              required: [
                "action",
                "estimated_annual_savings",
                "payback_period",
                "impact_reduction",
              ],
              propertyOrdering: [
                "action",
                "estimated_annual_savings",
                "payback_period",
                "impact_reduction",
              ],
            },
          },
          quick_win: { type: "STRING" },
        },
        required: [
          "category",
          "rank",
          "impact_score",
          "detective_insight",
          "recommendations",
          "quick_win",
        ],
        propertyOrdering: [
          "category",
          "rank",
          "impact_score",
          "detective_insight",
          "recommendations",
          "quick_win",
        ],
      },
    },
    overall_verdict: { type: "STRING" },
  },
  required: [
    "confidence_level",
    "confidence_explanation",
    "top_impacts",
    "overall_verdict",
  ],
  propertyOrdering: [
    "confidence_level",
    "confidence_explanation",
    "top_impacts",
    "overall_verdict",
  ],
} as const;

export async function runDetective(
  evidence: EvidencePacket,
): Promise<DetectiveOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to .env.local (server-side only, " +
        "never commit it) and restart the dev server.",
    );
  }

  const interventions = interventionsFor(
    evidence.categories.map((c) => c.category),
  );
  const rebates = rebatesForInterventions(interventions.map((i) => i.id));

  const packet = {
    school: evidence.profile,
    confidence_level: evidence.confidenceLevel,
    completeness_score: evidence.completenessScore,
    missing_categories: evidence.missingCategories,
    estimated_categories: evidence.estimatedCategories,
    totals: evidence.totals,
    categories: evidence.categories.map((c) => ({
      category: c.category,
      annual_co2e_kg: c.annualCo2eKg,
      annual_cost_usd: c.annualCostUsd,
      intensity: c.intensityMetric,
      benchmark_median: c.benchmark?.median,
      deviation_pct: c.deviationPct,
      anomaly: c.anomalyFlag,
      peer_percentile: c.peerPercentile,
    })),
    intervention_options: interventions,
    local_rebates: rebates,
  };

  const body = {
    systemInstruction: { parts: [{ text: DETECTIVE_SYSTEM }] },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Here is the school's computed EVIDENCE PACKET. Solve the case and return your structured analysis as JSON.\n\n${JSON.stringify(packet, null, 2)}`,
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      // Disable "thinking" — the task is rule-application over a packet, so this
      // keeps the call fast and cheap (important on the free tier).
      thinkingConfig: { thinkingBudget: 0 },
      temperature: 0.4,
      maxOutputTokens: 4096,
    },
  };

  let res: Response;
  try {
    res = await fetch(ENDPOINT(MODEL), {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify(body),
    });
  } catch (err) {
    // Network/transport failure — distinct from "the model replied with
    // something we couldn't parse" below, since the fix differs.
    throw new Error(
      `Gemini request failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Gemini API error ${res.status}: ${detail.slice(0, 500)}`);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
    promptFeedback?: { blockReason?: string };
  };

  const text =
    data.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? "")
      .join("") ?? "";

  if (!text) {
    const blocked = data.promptFeedback?.blockReason;
    throw new Error(
      blocked
        ? `Gemini returned no content (blocked: ${blocked}).`
        : "Gemini returned no content.",
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(
      "Gemini response was not valid JSON. Raw response: " + text.slice(0, 500),
    );
  }

  return DetectiveOutputSchema.parse(parsed) as DetectiveOutput;
}
