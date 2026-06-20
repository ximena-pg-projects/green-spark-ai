// lib/localDetective.ts
// ─────────────────────────────────────────────────────────────────────────────
// A deterministic, offline stand-in for the LLM detective (Layer 3).
//
// Why this exists: the real detective (lib/detective.ts) calls Gemini and needs
// an API key + network. For a live demo that must never blank out, the dashboard
// calls /api/analyze first and falls back to THIS if the key is missing or the
// call fails. It is pure (no I/O, no Date/Math.random) so it also runs in the
// browser.
//
// It follows the SAME rules the detective prompt enforces, so the fallback output
// is consistent with the AI's:
//   • headline CO2/$ come straight from the evidence packet (never invented)
//   • recommendations are chosen from lib/interventions.ts
//   • savings = intervention.savingsPctOfCategory × that category's annual cost
//   • the confidence gate is honored
// It is labeled as a non-AI fallback in the UI so we never claim it is the model.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  CategoryEvidence,
  CategoryKey,
  DetectiveOutput,
  EvidencePacket,
  Recommendation,
  TopImpact,
} from "./schema";
import { INTERVENTIONS, type Intervention } from "./interventions";
import { rebatesForIntervention } from "./rebates";

const DISPLAY: Record<CategoryKey, TopImpact["category"]> = {
  energy: "Energy",
  water: "Water",
  waste: "Waste",
  transportation: "Transportation",
  food: "Food",
};

function usd(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function paybackLabel(months: [number, number]): string {
  if (months[0] === 0 && months[1] === 0) return "Immediate (no upfront cost)";
  return `${months[0]}–${months[1]} months`;
}

/** Build one recommendation from an intervention + its category's cost. */
function toRecommendation(iv: Intervention, cat: CategoryEvidence): Recommendation {
  const savings = Math.round(cat.annualCostUsd * iv.savingsPctOfCategory);
  const rebate = rebatesForIntervention(iv.id)[0];
  const impact_reduction = rebate
    ? `${iv.co2Note}. Local incentive: ${rebate.program} (${rebate.region}) can offset part of the cost.`
    : iv.co2Note;
  return {
    action: iv.action,
    estimated_annual_savings: `${usd(savings)}/year`,
    payback_period: paybackLabel(iv.paybackMonths),
    impact_reduction,
  };
}

/**
 * Composite "how big a problem is this" score, 0–1. Blends the category's share
 * of total CO2 and cost with how far it sits above the peer benchmark, so an
 * anomalous-but-smaller category can still outrank a large-but-typical one.
 */
function compositeScore(
  cat: CategoryEvidence,
  maxCo2: number,
  maxCost: number,
): number {
  const co2Norm = maxCo2 > 0 ? cat.annualCo2eKg / maxCo2 : 0;
  const costNorm = maxCost > 0 ? cat.annualCostUsd / maxCost : 0;
  const devNorm = Math.max(0, Math.min(100, cat.deviationPct ?? 0)) / 100;
  return 0.5 * co2Norm + 0.3 * costNorm + 0.2 * devNorm;
}

function insightFor(cat: CategoryEvidence): string {
  const label = DISPLAY[cat.category].toLowerCase();
  const co2t = Math.round(cat.annualCo2eKg / 1000);
  const clue = cat.anomalyFlag
    ? `A major clue: it runs ${cat.anomalyFlag.toLowerCase()}.`
    : "It sits close to the typical range for similar schools, but the absolute total is large enough to act on.";
  const pct =
    cat.peerPercentile != null
      ? ` Among similar-size schools it lands in the ${cat.peerPercentile}th percentile for intensity.`
      : "";
  return `The evidence points to ${label} as a leading source of impact, about ${co2t.toLocaleString()} t of CO2 a year at ${usd(cat.annualCostUsd)} in annual cost. ${clue}${pct}`;
}

export function runLocalDetective(evidence: EvidencePacket): DetectiveOutput {
  const cats = evidence.categories;
  const maxCo2 = Math.max(1, ...cats.map((c) => c.annualCo2eKg));
  const maxCost = Math.max(1, ...cats.map((c) => c.annualCostUsd));

  const ranked = [...cats]
    .map((c) => ({ cat: c, score: compositeScore(c, maxCo2, maxCost) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const top_impacts: TopImpact[] = ranked.map(({ cat, score }, i) => {
    const pool = INTERVENTIONS.filter((iv) => iv.category === cat.category);
    // Highest-saving fixes first, but make sure a quick win is represented.
    const bySaving = [...pool].sort(
      (a, b) => b.savingsPctOfCategory - a.savingsPctOfCategory,
    );
    const picks: Intervention[] = bySaving.slice(0, 2);
    const quick = pool.find((iv) => iv.quickWin);
    if (quick && !picks.some((p) => p.id === quick.id)) picks.push(quick);

    const quickWinText = quick
      ? `${quick.action}. ${quick.co2Note}, ${paybackLabel(quick.paybackMonths).toLowerCase()}.`
      : picks[0]
        ? `Start with: ${picks[0].action.toLowerCase()}.`
        : "Begin tracking this category so progress is measurable.";

    return {
      category: DISPLAY[cat.category],
      rank: i + 1,
      impact_score: Math.round(score * 100),
      detective_insight: insightFor(cat),
      recommendations: picks.map((iv) => toRecommendation(iv, cat)),
      quick_win: quickWinText,
    };
  });

  // ── Confidence gate (mirrors the prompt) ──────────────────────────────────
  let confidence_explanation: string;
  if (evidence.confidenceLevel === "High") {
    confidence_explanation =
      "Every major category has usage-level data, so these conclusions rest on a fairly complete picture of the school.";
  } else {
    const missing = evidence.missingCategories.map((c) => DISPLAY[c]).join(", ");
    const estimated = evidence.estimatedCategories.map((c) => DISPLAY[c]).join(", ");
    let detail = "";
    if (estimated) {
      detail = ` ${estimated} ${evidence.estimatedCategories.length === 1 ? "was" : "were"} filled from benchmark medians for a school this size, not measured, so they sit at the typical range by construction and reveal few specific anomalies. Enter real numbers to sharpen this.`;
    } else if (missing) {
      detail = ` ${missing} ${evidence.missingCategories.length === 1 ? "is" : "are"} missing, so any conclusion there is partial and should be confirmed before acting.`;
    } else {
      detail =
        " Several figures are benchmark estimates rather than measured values, so treat the smaller differences with caution.";
    }
    confidence_explanation =
      `Confidence is ${evidence.confidenceLevel.toLowerCase()} because the data is only ${evidence.completenessScore}% complete.` +
      detail;
  }

  const totalSavings = top_impacts
    .flatMap((t) => t.recommendations)
    .reduce((sum, r) => {
      const n = Number(r.estimated_annual_savings.replace(/[^0-9.]/g, ""));
      return sum + (Number.isFinite(n) ? n : 0);
    }, 0);

  const lead = top_impacts[0];
  const overall_verdict = lead
    ? `${evidence.profile.name}'s biggest opportunity is ${lead.category.toLowerCase()}. Acting on the top three areas could save on the order of ${usd(totalSavings)} a year while cutting a meaningful share of the school's ${Math.round(evidence.totals.annualCo2eKg / 1000).toLocaleString()} t annual carbon footprint. These dollar figures are estimates to confirm with a vendor quote before spending, and a human decides what to fund.`
    : "There is not yet enough data to name a top opportunity. Add usage figures for the main categories, then re-run. Any future dollar figures are estimates to confirm with a vendor quote, and a human decides what to fund.";

  return {
    confidence_level: evidence.confidenceLevel,
    confidence_explanation,
    top_impacts,
    overall_verdict,
  };
}
