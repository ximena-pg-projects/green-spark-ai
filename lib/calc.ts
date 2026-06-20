// lib/calc.ts
// ─────────────────────────────────────────────────────────────────────────────
// Layer 1 of the reasoning pipeline: convert raw school inputs into annual
// CO2e (kg) + operating cost ($) per category, plus an intensity metric.
//
// PURE functions — no I/O, no Date/Math.random — so they ALSO run in the
// browser, which is what powers the what-if simulator (recompute on a slider
// drag without an API call). Every number comes from lib/factors.ts.
//
// Each calc returns the computed slice of a CategoryEvidence; Layer 2
// (benchmarks.ts) later adds the benchmark / anomaly / percentile / confidence
// fields. A category with too little data to compute returns null.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  CategoryEvidence,
  DataTier,
  EnergyInputs,
  FoodInputs,
  SchoolData,
  SchoolProfile,
  TransportationInputs,
  WasteInputs,
  WaterInputs,
} from "./schema";
import * as F from "./factors";

const round = (n: number) => Math.round(n);
const round1 = (n: number) => Math.round(n * 10) / 10;
const round2 = (n: number) => Math.round(n * 100) / 100;
const dedupe = (a: string[]) => [...new Set(a)];

function gridFactor(profile: SchoolProfile): number {
  return (
    F.GRID_CO2E_KG_PER_KWH[profile.gridRegion ?? "US_AVG"] ??
    F.GRID_CO2E_KG_PER_KWH.US_AVG
  );
}

/** Best tier of data present for a category: advanced > basic > profile. */
function tierOf<T extends object>(
  obj: T,
  advanced: (keyof T)[],
  basic: (keyof T)[],
): DataTier {
  const has = (keys: (keyof T)[]) =>
    keys.some((k) => obj[k] !== undefined && obj[k] !== null);
  if (has(advanced)) return "advanced";
  if (has(basic)) return "basic";
  return "profile";
}

// ── Energy ───────────────────────────────────────────────────────────────────
export function calcEnergy(
  e: EnergyInputs | undefined,
  profile: SchoolProfile,
): CategoryEvidence | null {
  if (!e) return null;
  const sources: string[] = [];
  const grid = gridFactor(profile);

  // Electricity kWh: prefer the meter, else infer from the bill.
  let kwh = e.annualElectricityKwh;
  let elecCost: number | undefined;
  if (e.monthlyElectricBill != null) elecCost = e.monthlyElectricBill * 12;
  if (kwh == null && elecCost != null) kwh = elecCost / F.ELECTRICITY_USD_PER_KWH;
  if (kwh == null) return null; // nothing to compute

  // Net out on-site solar generation.
  if (e.hasSolar && e.solarAnnualKwh) kwh = Math.max(0, kwh - e.solarAnnualKwh);

  let co2e = kwh * grid;
  let cost = elecCost ?? kwh * F.ELECTRICITY_USD_PER_KWH;
  sources.push(F.SOURCES.grid, F.SOURCES.elecPrice);

  // Heating fuel (electric heating is already inside the electricity figure).
  if (
    e.primaryHeatingSource &&
    e.primaryHeatingSource !== "electric" &&
    e.annualHeatingFuel
  ) {
    const h = F.HEATING[e.primaryHeatingSource];
    co2e += e.annualHeatingFuel * h.co2ePerUnit;
    cost += e.annualHeatingFuel * h.usdPerUnit;
    sources.push(F.SOURCES.heating);
  }

  return {
    category: "energy",
    tier: tierOf(
      e,
      ["annualElectricityKwh", "annualHeatingFuel", "ledPercent"],
      ["monthlyElectricBill", "primaryHeatingSource"],
    ),
    annualCo2eKg: round(co2e),
    annualCostUsd: round(cost),
    intensityMetric:
      profile.squareFootage != null && profile.squareFootage > 0
        ? {
            label: "Energy intensity",
            value: round1(kwh / profile.squareFootage),
            unit: "kWh/ft²·yr",
          }
        : undefined,
    sources: dedupe(sources),
  };
}

// ── Water ────────────────────────────────────────────────────────────────────
export function calcWater(
  w: WaterInputs | undefined,
  profile: SchoolProfile,
): CategoryEvidence | null {
  if (!w) return null;
  let gal = w.annualGallons;
  let cost: number | undefined;
  if (w.monthlyWaterBill != null) cost = w.monthlyWaterBill * 12;
  if (gal == null && cost != null) gal = cost / F.WATER_USD_PER_GAL;
  if (gal == null) return null;

  return {
    category: "water",
    tier: tierOf(
      w,
      ["annualGallons", "lowFlowPercent", "rainwaterHarvesting"],
      ["monthlyWaterBill", "hasIrrigatedField"],
    ),
    annualCo2eKg: round(gal * F.WATER_CO2E_KG_PER_GAL),
    annualCostUsd: round(cost ?? gal * F.WATER_USD_PER_GAL),
    intensityMetric: {
      label: "Water per student",
      value: round(gal / profile.students),
      unit: "gal/student·yr",
    },
    sources: [F.SOURCES.water, F.SOURCES.waterPrice],
  };
}

// ── Waste ────────────────────────────────────────────────────────────────────
export function calcWaste(
  s: WasteInputs | undefined,
  profile: SchoolProfile,
): CategoryEvidence | null {
  if (!s) return null;
  let tons = s.annualLandfillTons;
  if (tons == null && s.dumpsterSizeYards != null && s.collectionsPerWeek != null) {
    tons = s.dumpsterSizeYards * s.collectionsPerWeek * 52 * F.WASTE_TON_PER_CUYD;
  }
  if (tons == null) return null;

  let co2e = tons * F.WASTE_LANDFILL_CO2E_KG_PER_TON;
  let cost = tons * F.WASTE_USD_PER_TON;
  const sources = [F.SOURCES.waste, F.SOURCES.wastePrice];
  if (s.reamsPaperPerYear) {
    co2e += s.reamsPaperPerYear * F.PAPER_CO2E_KG_PER_REAM;
    cost += s.reamsPaperPerYear * F.PAPER_USD_PER_REAM;
    sources.push(F.SOURCES.paper);
  }

  return {
    category: "waste",
    tier: tierOf(
      s,
      ["annualLandfillTons", "annualRecycledTons", "annualCompostTons", "reamsPaperPerYear"],
      ["collectionsPerWeek", "dumpsterSizeYards", "recycling"],
    ),
    annualCo2eKg: round(co2e),
    annualCostUsd: round(cost),
    intensityMetric: {
      label: "Landfill waste",
      value: round2((tons * 2000) / profile.students / F.SCHOOL_DAYS),
      unit: "lb/student·day",
    },
    sources,
  };
}

// ── Transportation ───────────────────────────────────────────────────────────
export function calcTransportation(
  t: TransportationInputs | undefined,
  profile: SchoolProfile,
): CategoryEvidence | null {
  if (!t) return null;
  let co2e = 0;
  let cost = 0; // school operating cost = bus fuel only (commute isn't a school cost)
  const sources: string[] = [];

  if (t.annualDieselGallons != null && t.annualDieselGallons > 0) {
    const gal = t.annualDieselGallons;
    co2e += gal * F.DIESEL_CO2E_KG_PER_GAL;
    cost += gal * F.DIESEL_USD_PER_GAL;
    sources.push(F.SOURCES.bus, F.SOURCES.diesel);
  } else if (t.busCount != null && t.busCount > 0) {
    const miles = t.busCount * F.BUS_ANNUAL_MILES;
    const idle = t.busesIdle ? 1 + F.BUS_IDLE_PENALTY : 1;
    const fuel = t.busFuelType ?? "diesel";
    if (fuel === "electric") {
      const kwh = miles * F.BUS_ELECTRIC_KWH_PER_MILE;
      co2e += kwh * gridFactor(profile);
      cost += kwh * F.ELECTRICITY_USD_PER_KWH;
      sources.push(F.SOURCES.bus, F.SOURCES.grid);
    } else if (fuel === "cng") {
      const gge = (miles / F.BUS_CNG_MPGE) * idle;
      co2e += gge * F.CNG_CO2E_KG_PER_GGE;
      cost += gge * F.CNG_USD_PER_GGE;
      sources.push(F.SOURCES.bus);
    } else {
      const gal = (miles / F.BUS_DIESEL_MPG) * idle;
      co2e += gal * F.DIESEL_CO2E_KG_PER_GAL;
      cost += gal * F.DIESEL_USD_PER_GAL;
      sources.push(F.SOURCES.bus, F.SOURCES.diesel);
    }
  }

  // Student car commute — emissions only (not a school operating cost).
  if (t.pctCar != null && t.avgTripMilesPerStudent != null) {
    const carStudents = profile.students * (t.pctCar / 100);
    const carMiles =
      (carStudents * t.avgTripMilesPerStudent * 2 * F.SCHOOL_DAYS) /
      F.STUDENTS_PER_CAR;
    co2e += carMiles * F.CAR_CO2E_KG_PER_MILE;
    sources.push(F.SOURCES.car);
  }

  if (co2e === 0) return null;
  return {
    category: "transportation",
    tier: tierOf(
      t,
      ["busFuelType", "avgTripMilesPerStudent", "busesIdle"],
      ["busCount", "pctBus", "pctCar", "pctWalkBike"],
    ),
    annualCo2eKg: round(co2e),
    annualCostUsd: round(cost),
    intensityMetric: {
      label: "Transport CO₂e/student",
      value: round1(co2e / profile.students),
      unit: "kg/student·yr",
    },
    sources: dedupe(sources),
  };
}

// ── Food ─────────────────────────────────────────────────────────────────────
export function calcFood(
  f: FoodInputs | undefined,
  profile: SchoolProfile,
): CategoryEvidence | null {
  if (!f) return null;
  let co2e = 0;
  let cost = 0; // actionable cost = wasted food $
  const sources: string[] = [];

  if (f.providesLunch) {
    const meals = profile.students * F.LUNCH_PARTICIPATION * F.SCHOOL_DAYS;
    const perMeal = f.hasMeatFreeOptions
      ? F.MEAL_CO2E_KG_MIXED
      : F.MEAL_CO2E_KG_WITH_MEAT;
    co2e += meals * perMeal;
    sources.push(F.SOURCES.food);
  }
  if (f.plateWasteLbsPerDay != null) {
    co2e += f.plateWasteLbsPerDay * F.SCHOOL_DAYS * F.FOOD_WASTE_CO2E_KG_PER_LB;
    cost += f.plateWasteLbsPerDay * F.SCHOOL_DAYS * F.FOOD_USD_PER_LB_WASTED;
    sources.push(F.SOURCES.foodWaste);
  }
  if (co2e === 0) return null;

  return {
    category: "food",
    tier: tierOf(
      f,
      ["plateWasteLbsPerDay", "pctLocalSourcing", "singleUsePlastics"],
      ["providesLunch", "hasMeatFreeOptions"],
    ),
    annualCo2eKg: round(co2e),
    annualCostUsd: round(cost),
    intensityMetric:
      f.plateWasteLbsPerDay != null
        ? {
            label: "Food waste",
            value: round2(f.plateWasteLbsPerDay / profile.students),
            unit: "lb/student·day",
          }
        : undefined,
    sources,
  };
}

// ── Aggregate ────────────────────────────────────────────────────────────────
export interface Footprint {
  categories: CategoryEvidence[];
  totals: { annualCo2eKg: number; annualCostUsd: number };
}

/** Run every category calc and total the results. */
export function computeFootprint(school: SchoolData): Footprint {
  const p = school.profile;
  const categories = [
    calcEnergy(school.energy, p),
    calcWater(school.water, p),
    calcWaste(school.waste, p),
    calcTransportation(school.transportation, p),
    calcFood(school.food, p),
  ].filter((c): c is CategoryEvidence => c !== null);

  const totals = categories.reduce(
    (acc, c) => ({
      annualCo2eKg: acc.annualCo2eKg + c.annualCo2eKg,
      annualCostUsd: acc.annualCostUsd + c.annualCostUsd,
    }),
    { annualCo2eKg: 0, annualCostUsd: 0 },
  );
  return { categories, totals };
}
