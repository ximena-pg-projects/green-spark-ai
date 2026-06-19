// lib/simulate.ts
// ─────────────────────────────────────────────────────────────────────────────
// What-if simulator. Pure functions — same constraint as calc.ts — so this
// also runs client-side and can recompute live on a slider/checkbox change
// with no network round trip.
//
// MODEL: each Intervention in interventions.ts expresses its effect as
// `savingsPctOfCategory`, a fraction of that category's ANNUAL COST. That is
// the only grounded number the ROI library carries, so the simulator applies
// reductions in those exact terms rather than inventing a second, separate
// mapping from intervention -> raw input deltas (e.g. "set ledPercent to
// 100"). Doing that would let the simulator's numbers drift from the
// detective's cited savings instead of reproducing them.
//
// CO2 is assumed to scale down by the same fraction as cost within a
// category. This holds for usage-reduction interventions (LED, low-flow,
// no-idle, route optimization, recycling diversion, etc.) where less
// resource consumed means proportionally less cost and emissions. It is a
// simplification for fuel-switch interventions (e.g. rooftop solar, where the
// cost saving and the CO2 saving don't move in perfect lockstep because solar
// has its own embedded carbon/cost profile) — flagged below per-intervention
// so the UI can label it as an approximation rather than presenting false
// precision.
// ─────────────────────────────────────────────────────────────────────────────

import type { CategoryEvidence, CategoryKey, SchoolData } from "./schema";
import { computeFootprint, type Footprint } from "./calc";
import { INTERVENTIONS, type Intervention } from "./interventions";

/** Interventions whose cost saving and CO2 saving are not the same fraction. */
const APPROXIMATE_CO2_IDS = new Set(["solar"]);

export interface AppliedIntervention {
  intervention: Intervention;
  /** Dollars removed from that category's annual cost this scenario. */
  costDeltaUsd: number;
  /** kg CO2e removed from that category's annual footprint this scenario. */
  co2DeltaKg: number;
  /** True if the CO2 figure is a same-fraction-as-cost approximation. */
  co2IsApproximate: boolean;
}

export interface CategoryProjection {
  category: CategoryKey;
  baseline: Pick<CategoryEvidence, "annualCo2eKg" | "annualCostUsd"> | null;
  projected: { annualCo2eKg: number; annualCostUsd: number } | null;
  applied: AppliedIntervention[];
}

export interface SimulationResult {
  baseline: Footprint;
  projected: Footprint;
  delta: {
    annualCo2eKg: number; // negative = improvement
    annualCostUsd: number; // negative = improvement (a saving)
  };
  categories: CategoryProjection[];
  /** Estimated combined annual savings from interventions with no payback period. */
  immediateAnnualSavingsUsd: number;
  /** Simple combined payback window across stacked interventions, months. */
  combinedPaybackMonthsRange: [number, number] | null;
  warnings: string[];
}

/**
 * Look up interventions by id, defaulting to the full library if any id is
 * unrecognized (caller-facing validation should happen at the API boundary;
 * this stays pure and just skips unknowns, recording a warning).
 */
function resolveInterventions(ids: string[]): {
  found: Intervention[];
  unknownIds: string[];
} {
  const byId = new Map(INTERVENTIONS.map((i) => [i.id, i]));
  const found: Intervention[] = [];
  const unknownIds: string[] = [];
  for (const id of ids) {
    const match = byId.get(id);
    if (match) found.push(match);
    else unknownIds.push(id);
  }
  return { found, unknownIds };
}

/**
 * Apply a stack of interventions (by id) to a school's computed baseline and
 * return the projected footprint, per-category breakdown, and combined
 * savings/payback. Multiple interventions in the same category stack
 * additively on that category's cost/CO2 (capped at 100% of the category so
 * stacking can't reduce a category below zero).
 */
export function simulate(
  school: SchoolData,
  interventionIds: string[],
): SimulationResult {
  const baseline = computeFootprint(school);
  const warnings: string[] = [];

  const { found, unknownIds } = resolveInterventions(interventionIds);
  if (unknownIds.length > 0) {
    warnings.push(`Unknown intervention id(s) ignored: ${unknownIds.join(", ")}`);
  }

  // Group requested interventions by category so we can cap combined
  // reduction at 100% of that category's baseline.
  const byCategory = new Map<CategoryKey, Intervention[]>();
  for (const iv of found) {
    const list = byCategory.get(iv.category) ?? [];
    list.push(iv);
    byCategory.set(iv.category, list);
  }

  const categories: CategoryProjection[] = baseline.categories.map((cat) =>
    projectCategory(cat, byCategory.get(cat.category) ?? [], warnings),
  );

  // Categories with no baseline data can't have interventions applied even
  // if requested — surface that rather than silently dropping it.
  for (const [cat, ivs] of byCategory) {
    if (!baseline.categories.some((c) => c.category === cat)) {
      warnings.push(
        `Requested ${ivs.map((i) => i.id).join(", ")} but "${cat}" has no baseline data to apply it to.`,
      );
    }
  }

  const projectedTotals = categories.reduce(
    (acc, c) => ({
      annualCo2eKg: acc.annualCo2eKg + (c.projected?.annualCo2eKg ?? 0),
      annualCostUsd: acc.annualCostUsd + (c.projected?.annualCostUsd ?? 0),
    }),
    { annualCo2eKg: 0, annualCostUsd: 0 },
  );

  // Categories untouched by any intervention still need to contribute their
  // baseline to the projected total (projectCategory returns null projected
  // values only when there genuinely was no baseline).
  for (const cat of categories) {
    if (cat.projected === null && cat.baseline !== null) {
      projectedTotals.annualCo2eKg += cat.baseline.annualCo2eKg;
      projectedTotals.annualCostUsd += cat.baseline.annualCostUsd;
    }
  }

  // costDeltaUsd is negative (cost going DOWN); a "savings" figure should be
  // reported as positive dollars, so flip sign here.
  const allApplied = categories.flatMap((c) => c.applied);
  const immediateAnnualSavingsUsd = allApplied
    .filter((a) => a.intervention.paybackMonths[1] === 0)
    .reduce((sum, a) => sum - a.costDeltaUsd, 0);

  const paybackCandidates = allApplied
    .map((a) => a.intervention.paybackMonths)
    .filter(([, max]) => max > 0);
  const combinedPaybackMonthsRange: [number, number] | null =
    paybackCandidates.length === 0
      ? null
      : [
          Math.min(...paybackCandidates.map(([min]) => min)),
          Math.max(...paybackCandidates.map(([, max]) => max)),
        ];

  return {
    baseline,
    projected: { categories: rebuildProjectedCategories(categories, baseline), totals: projectedTotals },
    delta: {
      annualCo2eKg: projectedTotals.annualCo2eKg - baseline.totals.annualCo2eKg,
      annualCostUsd: projectedTotals.annualCostUsd - baseline.totals.annualCostUsd,
    },
    categories,
    immediateAnnualSavingsUsd: round2(immediateAnnualSavingsUsd),
    combinedPaybackMonthsRange,
    warnings,
  };
}

/** Apply a category's requested interventions, capped at 100% reduction. */
function projectCategory(
  baselineCat: CategoryEvidence,
  requested: Intervention[],
  warnings: string[],
): CategoryProjection {
  if (requested.length === 0) {
    return {
      category: baselineCat.category,
      baseline: pick(baselineCat),
      projected: null, // unchanged — caller falls back to baseline
      applied: [],
    };
  }

  const rawCostPct = requested.reduce((sum, iv) => sum + iv.savingsPctOfCategory, 0);
  const cappedCostPct = Math.min(rawCostPct, 1);
  if (rawCostPct > 1) {
    warnings.push(
      `Stacked interventions in "${baselineCat.category}" exceed 100% of category cost (${(rawCostPct * 100).toFixed(0)}%); capped at 100%.`,
    );
  }

  const applied: AppliedIntervention[] = requested.map((iv) => {
    // Each intervention's *share* of the (possibly capped) total, so the
    // displayed per-intervention breakdown still sums to the capped total.
    const share = rawCostPct > 0 ? iv.savingsPctOfCategory / rawCostPct : 0;
    const costDeltaUsd = -round2(baselineCat.annualCostUsd * cappedCostPct * share);
    const co2DeltaKg = -round2(baselineCat.annualCo2eKg * cappedCostPct * share);
    return {
      intervention: iv,
      costDeltaUsd,
      co2DeltaKg,
      co2IsApproximate: APPROXIMATE_CO2_IDS.has(iv.id),
    };
  });

  const totalCostDelta = applied.reduce((s, a) => s + a.costDeltaUsd, 0);
  const totalCo2Delta = applied.reduce((s, a) => s + a.co2DeltaKg, 0);

  return {
    category: baselineCat.category,
    baseline: pick(baselineCat),
    projected: {
      annualCostUsd: round2(baselineCat.annualCostUsd + totalCostDelta),
      annualCo2eKg: round2(baselineCat.annualCo2eKg + totalCo2Delta),
    },
    applied,
  };
}

/** Reconstruct full CategoryEvidence[] for the projected Footprint shape. */
function rebuildProjectedCategories(
  categories: CategoryProjection[],
  baseline: Footprint,
): CategoryEvidence[] {
  return baseline.categories.map((baseCat) => {
    const proj = categories.find((c) => c.category === baseCat.category);
    if (!proj?.projected) return baseCat;
    return {
      ...baseCat,
      annualCostUsd: proj.projected.annualCostUsd,
      annualCo2eKg: proj.projected.annualCo2eKg,
    };
  });
}

function pick(
  c: CategoryEvidence,
): Pick<CategoryEvidence, "annualCo2eKg" | "annualCostUsd"> {
  return { annualCo2eKg: c.annualCo2eKg, annualCostUsd: c.annualCostUsd };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
