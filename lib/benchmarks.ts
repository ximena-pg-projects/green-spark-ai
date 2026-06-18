// lib/benchmarks.ts
// ─────────────────────────────────────────────────────────────────────────────
// Layer 2 of the reasoning pipeline: genuine pattern/anomaly detection on the
// computed numbers from Layer 1 (lib/calc.ts). For each category it adds:
//   • a benchmark median + deviation vs. similar schools
//   • a peer percentile (vs. data/peers.json)
//   • an anomaly flag when the school is notably above/below the median
// plus a data-completeness score → confidence level (the responsible-AI gate).
//
// buildEvidencePacket() is the single entry point: SchoolData → EvidencePacket,
// which is exactly what the LLM detective (Layer 3) reasons over.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  CategoryEvidence,
  CategoryKey,
  ConfidenceLevel,
  DataTier,
  EvidencePacket,
  SchoolData,
} from "./schema";
import { computeFootprint } from "./calc";
import { BENCHMARKS } from "./factors";
import peersData from "../data/peers.json";

interface Peer {
  id: string;
  students: number;
  energyKwhPerSqft: number;
  waterGalPerStudent: number;
  wasteLbPerStudentDay: number;
  transportKgPerStudent: number;
  foodWasteLbPerStudentDay: number;
}
const peers = peersData as unknown as Peer[];

const ALL: CategoryKey[] = ["energy", "water", "waste", "transportation", "food"];

// Which peer metric + benchmark median each category's intensity compares to.
const PEER_KEY: Record<CategoryKey, keyof Peer> = {
  energy: "energyKwhPerSqft",
  water: "waterGalPerStudent",
  waste: "wasteLbPerStudentDay",
  transportation: "transportKgPerStudent",
  food: "foodWasteLbPerStudentDay",
};
const BENCH_MEDIAN: Record<CategoryKey, number> = {
  energy: BENCHMARKS.energyKwhPerSqft,
  water: BENCHMARKS.waterGalPerStudent,
  waste: BENCHMARKS.wasteLbPerStudentDay,
  transportation: BENCHMARKS.transportKgPerStudent,
  food: BENCHMARKS.foodWasteLbPerStudentDay,
};

// Impact weighting for the completeness score (sums to 1).
const IMPACT_WEIGHT: Record<CategoryKey, number> = {
  energy: 0.3,
  transportation: 0.25,
  food: 0.2,
  waste: 0.15,
  water: 0.1,
};
const TIER_CREDIT: Record<DataTier, number> = {
  profile: 0.2,
  basic: 0.6,
  advanced: 1.0,
};

/** Share of peers at or below this value (higher percentile = more intensive). */
function percentile(values: number[], v: number): number {
  const below = values.filter((x) => x <= v).length;
  return Math.round((below / values.length) * 100);
}

/** Attach the Layer-2 fields to one category's calc result. */
function enrich(cat: CategoryEvidence): CategoryEvidence {
  const value = cat.intensityMetric?.value;
  if (value == null) return cat;
  const median = BENCH_MEDIAN[cat.category];
  const deviationPct = Math.round(((value - median) / median) * 100);
  const peerVals = peers.map((p) => p[PEER_KEY[cat.category]] as number);

  let anomalyFlag: string | undefined;
  if (deviationPct >= 15) {
    anomalyFlag = `${deviationPct}% above the median for similar schools`;
  } else if (deviationPct <= -15) {
    anomalyFlag = `${Math.abs(deviationPct)}% below the median (better than typical)`;
  }

  return {
    ...cat,
    benchmark: {
      label: cat.intensityMetric!.label,
      median,
      unit: cat.intensityMetric!.unit,
    },
    deviationPct,
    anomalyFlag,
    peerPercentile: percentile(peerVals, value),
  };
}

export function buildEvidencePacket(school: SchoolData): EvidencePacket {
  const fp = computeFootprint(school);
  const categories = fp.categories.map(enrich);

  const present = new Set(categories.map((c) => c.category));
  const missingCategories = ALL.filter((k) => !present.has(k));

  // Impact-weighted completeness: each category contributes weight × tier credit.
  let score = 0;
  for (const k of ALL) {
    const cat = categories.find((c) => c.category === k);
    score += IMPACT_WEIGHT[k] * (cat ? TIER_CREDIT[cat.tier] : 0);
  }
  const completenessScore = Math.round(score * 100);
  const confidenceLevel: ConfidenceLevel =
    completenessScore >= 70 ? "High" : completenessScore >= 40 ? "Medium" : "Low";

  return {
    profile: school.profile,
    categories,
    totals: fp.totals,
    completenessScore,
    confidenceLevel,
    missingCategories,
  };
}
