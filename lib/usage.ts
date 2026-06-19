// lib/usage.ts
// ─────────────────────────────────────────────────────────────────────────────
// "I have the real number" support for the dashboard.
//
// The benchmark autofill (lib/estimate.ts) fills every category from medians and
// flags them all in `estimatedCategories`, so a profile-only school lands at Low
// confidence. This module lets a user replace the ONE headline usage figure per
// category with a real number they got from the school (the utility bill, the
// waste invoice, the front office). Entering it graduates that category out of
// `estimatedCategories`, so the confidence gate (lib/benchmarks.ts) gives it full
// weight and the meter climbs Low → Medium → High.
//
// We expose one figure per category — the dominant driver of that category's
// CO2/cost — not every sub-field. It is what a student can realistically ask for,
// and it carries the bulk of the calc. Pure: no I/O, returns new objects, so it
// runs client-side on every keystroke.
// ─────────────────────────────────────────────────────────────────────────────

import type { CategoryKey, SchoolData } from "./schema";

/** The single headline usage figure per category, and where a student finds it. */
export interface UsageField {
  /** What the number is, in plain words. */
  label: string;
  /** Unit shown next to the input. */
  unit: string;
  /** Where to get the real number — written for a student, not a facilities pro. */
  source: string;
}

export const USAGE_FIELDS: Record<CategoryKey, UsageField> = {
  energy: {
    label: "Electricity used in a year",
    unit: "kWh",
    source:
      "On the electric bill (look for annual or monthly kWh), or in ENERGY STAR Portfolio Manager. Ask facilities or the business office.",
  },
  water: {
    label: "Water used in a year",
    unit: "gallons",
    source:
      "On the water bill. If you only have one month, multiply by 12. Ask facilities or the business office.",
  },
  waste: {
    label: "Trash sent to landfill in a year",
    unit: "tons",
    source:
      "On the waste hauler's invoice, or estimate from dumpster size × pickups per week. Ask facilities.",
  },
  transportation: {
    label: "Number of school buses",
    unit: "buses",
    source: "Ask the front office or the transportation coordinator.",
  },
  food: {
    label: "Cafeteria food thrown out per day",
    unit: "lbs",
    source:
      "From a one-week cafeteria waste audit (weigh the bins after lunch). Ask the cafeteria manager.",
  },
};

/** Read the current headline usage value for a category (estimate or entered). */
export function getUsageValue(
  school: SchoolData,
  key: CategoryKey,
): number | undefined {
  switch (key) {
    case "energy":
      return school.energy?.annualElectricityKwh;
    case "water":
      return school.water?.annualGallons;
    case "waste":
      return school.waste?.annualLandfillTons;
    case "transportation":
      return school.transportation?.busCount;
    case "food":
      return school.food?.plateWasteLbsPerDay;
  }
}

/** Return a copy of `school` with one category's headline figure set. */
function setUsageValue(
  school: SchoolData,
  key: CategoryKey,
  value: number,
): SchoolData {
  switch (key) {
    case "energy":
      return { ...school, energy: { ...school.energy, annualElectricityKwh: value } };
    case "water":
      return { ...school, water: { ...school.water, annualGallons: value } };
    case "waste":
      return { ...school, waste: { ...school.waste, annualLandfillTons: value } };
    case "transportation":
      return { ...school, transportation: { ...school.transportation, busCount: value } };
    case "food":
      return { ...school, food: { ...school.food, plateWasteLbsPerDay: value } };
  }
}

/**
 * Apply user-entered real numbers on top of a (possibly estimated) school.
 * Each overridden category has its headline figure replaced AND is removed from
 * `estimatedCategories`, so the confidence gate counts it as measured data.
 * A zero, blank, or non-finite value is ignored (the estimate stands).
 */
export function withRealUsage(
  school: SchoolData,
  overrides: Partial<Record<CategoryKey, number>>,
): SchoolData {
  let next = school;
  const stillEstimated = new Set(school.estimatedCategories ?? []);
  for (const key of Object.keys(overrides) as CategoryKey[]) {
    const value = overrides[key];
    if (value == null || !Number.isFinite(value) || value <= 0) continue;
    next = setUsageValue(next, key, value);
    stillEstimated.delete(key);
  }
  return { ...next, estimatedCategories: [...stillEstimated] };
}
