// lib/detective.ts
// Layer 3 — the LLM detective. Takes the computed evidence packet, asks Claude to
// rank impacts and choose ROI fixes, and returns strict structured JSON.
//
// We force structured output via a single `submit_analysis` tool (tool_choice),
// which is reliable across SDK versions, then validate the result with Zod so a
// malformed response fails loudly instead of reaching the UI.
// ── Why this file uses the OpenAI SDK, not @anthropic-ai/sdk ─────────────────
// We're calling Claude through CometAPI (a third-party proxy), not Anthropic
// directly. CometAPI speaks the OpenAI request/response schema at
// POST https://api.cometapi.com/v1/chat/completions — NOT Anthropic's native
// /v1/messages schema. Pointing the Anthropic SDK's `baseURL` at CometAPI does
// not work: the SDK serializes tool definitions as Anthropic's `input_schema`
// blocks and expects `content: [{type: "tool_use", ...}]` back, while CometAPI
// expects OpenAI-style `tools: [{type: "function", function: {...}}]` and
// returns `choices[0].message.tool_calls`. So this uses the `openai` package
// configured with CometAPI's baseURL, and a Claude model string in `model`.
//
// If the team later gets a real Anthropic API key and wants to call Anthropic
// directly instead of through CometAPI, swap this file back to
// @anthropic-ai/sdk with its native tool_choice/input_schema shape (see git
// history / the original version of this file for that path) — don't try to
// run both schemas through one client.
//
// Structured output is still forced via a single tool the model must call,
// then validated with Zod so a malformed response fails loudly instead of
// reaching the UI.

import OpenAI from "openai";
import { z } from "zod";
import type { DetectiveOutput, EvidencePacket } from "./schema";
import { DETECTIVE_SYSTEM } from "./detectivePrompt";
import { interventionsFor } from "./interventions";
import { rebatesForInterventions } from "./rebates";

// CometAPI has documented passing Claude model strings directly (e.g.
// "claude-sonnet-4-6") through their OpenAI-compatible endpoint. Confirm the
// exact current model string against the CometAPI model list before relying
// on this in production — provider-side model names can change.
const MODEL = process.env.COMET_MODEL ?? "claude-sonnet-4-6";

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

// ── The tool the model must call, in OpenAI's function-calling shape ─────────
// Same fields as before; reshaped from Anthropic's flat `input_schema` into
// OpenAI's `{type: "function", function: {name, description, parameters}}`.
const SUBMIT_TOOL: OpenAI.Chat.Completions.ChatCompletionTool = {
  type: "function",
  function: {
    name: "submit_analysis",
    description:
      "Return the Environmental AI Detective's structured analysis of the school.",
    parameters: {
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
  },
};
 
function getClient(): OpenAI {
  const apiKey = process.env.COMET_API_KEY;
  if (!apiKey) {
    throw new Error(
      "COMET_API_KEY is not set. Add it to .env.local (server-side only, " +
        "never commit it) and restart the dev server.",
    );
  }
  return new OpenAI({
    apiKey,
    baseURL: "https://api.cometapi.com/v1",
  });
}
 
export async function runDetective(
  evidence: EvidencePacket,
): Promise<DetectiveOutput> {
  const client = getClient();
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
 
  let response: OpenAI.Chat.Completions.ChatCompletion;
  try {
    response = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 4096,
      tools: [SUBMIT_TOOL],
      tool_choice: {
        type: "function",
        function: { name: "submit_analysis" },
      },
      messages: [
        { role: "system", content: DETECTIVE_SYSTEM },
        {
          role: "user",
          content: `Here is the school's computed EVIDENCE PACKET. Solve the case and call submit_analysis with your analysis.\n\n${JSON.stringify(packet, null, 2)}`,
        },
      ],
    });
  } catch (err) {
    // Surface CometAPI/network failures distinctly from "model responded
    // with something we couldn't parse" below, since the fix differs:
    // this branch means check COMET_API_KEY / COMET_MODEL / network, the
    // branch below means the model's tool call was malformed.
    throw new Error(
      `CometAPI request failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
 
  const toolCall = response.choices[0]?.message?.tool_calls?.find(
    (t) => t.function.name === "submit_analysis",
  );
  if (!toolCall) {
    throw new Error(
      "The detective did not return a structured analysis (no submit_analysis tool call in response).",
    );
  }
 
  let parsedArgs: unknown;
  try {
    parsedArgs = JSON.parse(toolCall.function.arguments);
  } catch {
    throw new Error(
      "Detective's tool call arguments were not valid JSON. Raw response: " +
        toolCall.function.arguments.slice(0, 500),
    );
  }
 
  return DetectiveOutputSchema.parse(parsedArgs) as DetectiveOutput;
}
