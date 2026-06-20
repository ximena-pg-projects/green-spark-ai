// lib/rebates.ts
// ─────────────────────────────────────────────────────────────────────────────
// Local + federal incentives, matched to the interventions the detective
// recommends. This is what makes the ROI *local and concrete* rather than a
// generic national average — the heaviest rubric row (Problem Understanding,
// 30%) rewards local specificity, and matching a real state or federal
// incentive to a recommended fix is exactly that.
//
// Curated, clearly-labeled programs are keyed to the flagship school context
// and to the intervention library. Swap data/rebates.json when the flagship
// school changes.
// ─────────────────────────────────────────────────────────────────────────────

import type { CategoryKey } from "./schema";
import { INTERVENTIONS } from "./interventions";
import rebatesData from "../data/rebates.json";

export interface Rebate {
  id: string;
  program: string;
  region: string;
  kind: "rebate" | "tax credit" | "grant" | "program";
  appliesToInterventions: string[];
  summary: string;
  eligibility: string;
  source: string;
}

export const REBATES = rebatesData as Rebate[];

/** Map every intervention id to the category it belongs to (for category lookups). */
const CATEGORY_OF = new Map(INTERVENTIONS.map((i) => [i.id, i.category]));

/** Rebates that apply to a specific intervention id. */
export function rebatesForIntervention(interventionId: string): Rebate[] {
  return REBATES.filter((r) => r.appliesToInterventions.includes(interventionId));
}

/** Rebates touching any intervention in the given category. */
export function rebatesForCategory(category: CategoryKey): Rebate[] {
  return REBATES.filter((r) =>
    r.appliesToInterventions.some((id) => CATEGORY_OF.get(id) === category),
  );
}

/** Dedup rebates across a set of intervention ids. */
export function rebatesForInterventions(interventionIds: string[]): Rebate[] {
  const ids = new Set(interventionIds);
  const seen = new Set<string>();
  const out: Rebate[] = [];
  for (const r of REBATES) {
    if (r.appliesToInterventions.some((i) => ids.has(i)) && !seen.has(r.id)) {
      seen.add(r.id);
      out.push(r);
    }
  }
  return out;
}
