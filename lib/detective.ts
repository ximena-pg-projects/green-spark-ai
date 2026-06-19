// lib/detective.ts
// Layer 3 — the LLM detective. Takes the computed evidence packet, asks Claude to
// rank impacts and choose ROI fixes, and returns strict structured JSON.
//
// We force structured output via a single `submit_analysis` tool (tool_choice),
// which is reliable across SDK versions, then validate the result with Zod so a
// malformed response fails loudly instead of reaching the UI.

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { DetectiveOutput, EvidencePacket } from "./schema";
import { DETECTIVE_SYSTEM } from "./detectivePrompt";
import { interventionsFor } from "./interventions";
import { rebatesForInterventions } from "./rebates";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";

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

// ── The tool Claude must call (its input_schema == the detective output) ─────
const SUBMIT_TOOL: Anthropic.Tool = {
  name: "submit_analysis",
  description:
    "Return the Environmental AI Detective's structured analysis of the school.",
  input_schema: {
    type: "object",
    properties: {
      confidence_level: { type: "string", enum: ["Low", "Medium", "High"] },
      confidence_explanation: { type: "string" },
      top_impacts: {
        type: "array",
        items: {
          type: "object",
          properties: {
            category: {
              type: "string",
              enum: ["Energy", "Water", "Waste", "Transportation", "Food"],
            },
            rank: { type: "number" },
            impact_score: { type: "number" },
            detective_insight: { type: "string" },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  estimated_annual_savings: { type: "string" },
                  payback_period: { type: "string" },
                  impact_reduction: { type: "string" },
                },
                required: [
                  "action",
                  "estimated_annual_savings",
                  "payback_period",
                  "impact_reduction",
                ],
              },
            },
            quick_win: { type: "string" },
          },
          required: [
            "category",
            "rank",
            "impact_score",
            "detective_insight",
            "recommendations",
            "quick_win",
          ],
        },
      },
      overall_verdict: { type: "string" },
    },
    required: [
      "confidence_level",
      "confidence_explanation",
      "top_impacts",
      "overall_verdict",
    ],
  },
};

export async function runDetective(
  evidence: EvidencePacket,
): Promise<DetectiveOutput> {
  const client = new Anthropic();
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

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: DETECTIVE_SYSTEM,
    tools: [SUBMIT_TOOL],
    tool_choice: { type: "tool", name: "submit_analysis" },
    messages: [
      {
        role: "user",
        content: `Here is the school's computed EVIDENCE PACKET. Solve the case and call submit_analysis with your analysis.\n\n${JSON.stringify(packet, null, 2)}`,
      },
    ],
  });

  const block = response.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") {
    throw new Error("Detective did not return a structured analysis.");
  }
  return DetectiveOutputSchema.parse(block.input) as DetectiveOutput;
}
