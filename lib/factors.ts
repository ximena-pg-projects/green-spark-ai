// lib/factors.ts
// ─────────────────────────────────────────────────────────────────────────────
// Emission + cost factors for the calc engine (Layer 1, lib/calc.ts).
// Representative US figures. Every number is tied to a citation in SOURCES so
// the analysis is defensible — this is what makes the Data Disclosure and
// Responsible AI story hold up. Pure data, no logic.
// Swap in school-specific values (e.g. real local utility rates) where known.
// ─────────────────────────────────────────────────────────────────────────────

// ── Electricity ──────────────────────────────────────────────────────────────
/** Grid CO2e intensity (kg CO2e per kWh) by EPA eGRID2022 subregion. */
export const GRID_CO2E_KG_PER_KWH: Record<string, number> = {
  US_AVG: 0.4,
  ERCT: 0.41, // ERCOT / Texas
  NYUP: 0.13, // Upstate NY
  NYCW: 0.29, // NYC + Westchester
  RFCE: 0.3, // Mid-Atlantic (PJM East)
  CAMX: 0.21, // California
  RMPA: 0.54, // Colorado / Rockies
  SRSO: 0.42, // Southeast
};

export const ELECTRICITY_USD_PER_KWH = 0.13;

// ── Heating fuels (kg CO2e + USD per unit). Electric heating is counted in
//    electricity, so its factors are zero here. ───────────────────────────────
export const HEATING: Record<
  "natural_gas" | "oil" | "propane" | "electric",
  { co2ePerUnit: number; usdPerUnit: number; unit: string }
> = {
  natural_gas: { co2ePerUnit: 5.3, usdPerUnit: 1.2, unit: "therm" },
  oil: { co2ePerUnit: 10.16, usdPerUnit: 4.0, unit: "gallon" },
  propane: { co2ePerUnit: 5.72, usdPerUnit: 2.5, unit: "gallon" },
  electric: { co2ePerUnit: 0, usdPerUnit: 0, unit: "kWh" },
};

// ── Water (per gallon) ───────────────────────────────────────────────────────
export const WATER_CO2E_KG_PER_GAL = 0.0016;
export const WATER_USD_PER_GAL = 0.011;

// ── Waste ────────────────────────────────────────────────────────────────────
export const WASTE_LANDFILL_CO2E_KG_PER_TON = 580;
export const WASTE_USD_PER_TON = 70;
/** Volume→weight when only dumpster size is known (~150 lb / yd³ compacted MSW). */
export const WASTE_TON_PER_CUYD = 0.075;
export const PAPER_CO2E_KG_PER_REAM = 5.0;
export const PAPER_USD_PER_REAM = 5.0;

// ── Transportation ───────────────────────────────────────────────────────────
export const BUS_ANNUAL_MILES = 12000; // typical US school bus
export const BUS_DIESEL_MPG = 7;
export const BUS_CNG_MPGE = 6;
export const BUS_ELECTRIC_KWH_PER_MILE = 2.0;
export const BUS_IDLE_PENALTY = 0.06; // +6% fuel if buses idle at pickup/dropoff
export const DIESEL_CO2E_KG_PER_GAL = 10.18;
export const DIESEL_USD_PER_GAL = 4.0;
export const CNG_CO2E_KG_PER_GGE = 8.0;
export const CNG_USD_PER_GGE = 2.5;
export const CAR_CO2E_KG_PER_MILE = 0.4; // EPA average passenger vehicle
export const STUDENTS_PER_CAR = 1.4; // carpool factor
export const SCHOOL_DAYS = 180;

// ── Food ─────────────────────────────────────────────────────────────────────
export const MEAL_CO2E_KG_WITH_MEAT = 2.2;
export const MEAL_CO2E_KG_MIXED = 1.6; // when meat-free options are offered
export const LUNCH_PARTICIPATION = 0.6; // share of students eating school lunch
export const FOOD_WASTE_CO2E_KG_PER_LB = 1.15;
export const FOOD_USD_PER_LB_WASTED = 2.0;

// ── Benchmark median intensities (Layer 2 anomaly detection + UI context) ─────
export const BENCHMARKS = {
  energyKwhPerSqft: 10.5,
  waterGalPerStudent: 2500,
  wasteLbPerStudentDay: 0.6,
  transportKgPerStudent: 350,
  foodWasteLbPerStudentDay: 0.12,
};

// ── Citations — referenced by calc.ts so every figure is traceable ───────────
export const SOURCES = {
  grid: "EPA eGRID2022 subregion output emission rates",
  elecPrice: "EIA average US commercial electricity price (2024)",
  heating: "EPA GHG Emission Factors Hub — stationary combustion",
  water:
    "Water–energy nexus (~4 kWh per 1,000 gal supply + wastewater) × grid average",
  waterPrice: "Typical US combined water + sewer rate (~$11 / 1,000 gal)",
  waste: "EPA WARM — mixed-MSW landfilling net emissions",
  wastePrice: "Typical US tipping fee + hauling (~$70/ton)",
  paper: "Lifecycle of virgin office paper (~5 kg CO2e/ream)",
  bus: "EPA Clean School Bus + AFDC typical school-bus figures",
  diesel: "EPA GHG Emission Factors Hub — diesel",
  car: "EPA average passenger vehicle (~404 g CO2/mile)",
  food: "Per-meal lifecycle emissions (Our World in Data / Project Drawdown)",
  foodWaste: "EPA WARM food waste + embodied food production",
  cbecs: "EIA CBECS education-building energy intensity",
};
