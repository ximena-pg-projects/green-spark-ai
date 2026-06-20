// lib/estimate.ts
// ─────────────────────────────────────────────────────────────────────────────
// Benchmark autofill. Given ONLY a school profile (size, enrollment, location),
// estimate a full set of category inputs from the published median intensities
// in lib/factors.ts, scaled by square footage / student count.
//
// This is what lets the tool work with almost no data — the brief explicitly
// warns against systems that require private school data. Every category here is
// tagged in `estimatedCategories`, so lib/benchmarks.ts down-weights it and the
// confidence gate reports Low/Medium, never High. The user can then overwrite
// any field with a real number, and that category graduates to full weight.
//
// By construction these estimates sit AT the peer median, so the detective will
// (correctly) report few anomalies and low certainty until real numbers arrive.
// ─────────────────────────────────────────────────────────────────────────────

import { BENCHMARKS, SCHOOL_DAYS } from "./factors";
import type { CategoryKey, SchoolData, SchoolProfile } from "./schema";

const ALL: CategoryKey[] = ["energy", "water", "waste", "transportation", "food"];

const round = (n: number) => Math.round(n);

/** Profile in, fully-estimated SchoolData out. All categories flagged estimated. */
export function estimateFromProfile(profile: SchoolProfile): SchoolData {
  const { students } = profile;
  const sqft = profile.squareFootage ?? Math.max(75_000, students * 120);

  // Energy: electricity from CBECS-style kWh/ft²; heating from a typical
  // per-ft² gas burn for a school in a mixed climate.
  const annualElectricityKwh = round(BENCHMARKS.energyKwhPerSqft * sqft);
  const annualHeatingFuel = round(sqft * 0.45); // therms

  // Water: median gallons per student.
  const annualGallons = round(BENCHMARKS.waterGalPerStudent * students);

  // Waste: median lb/student/day → annual landfill tons.
  const annualLandfillTons = round(
    (BENCHMARKS.wasteLbPerStudentDay * students * SCHOOL_DAYS) / 2000,
  );

  // Transportation: typical mode split + a bus fleet sized to ridership.
  const pctBus = 50;
  const pctCar = 40;
  const pctWalkBike = 10;
  const busCount = Math.max(1, round((students * (pctBus / 100)) / 80));

  // Food: median plate waste, lunch served, no meat-free option assumed.
  const plateWasteLbsPerDay = round(BENCHMARKS.foodWasteLbPerStudentDay * students);

  return {
    profile,
    energy: {
      annualElectricityKwh,
      primaryHeatingSource: "natural_gas",
      annualHeatingFuel,
      heatingFuelUnit: "therms",
      hasSolar: false,
      ledPercent: 50,
    },
    water: {
      annualGallons,
      hasIrrigatedField: students > 400,
      lowFlowPercent: 40,
      rainwaterHarvesting: false,
    },
    waste: {
      annualLandfillTons,
      recycling: "partial",
      reamsPaperPerYear: round(students * 3),
    },
    transportation: {
      busCount,
      busFuelType: "diesel",
      pctBus,
      pctCar,
      pctWalkBike,
      avgTripMilesPerStudent: 5,
      busesIdle: false,
    },
    food: {
      providesLunch: true,
      hasMeatFreeOptions: false,
      plateWasteLbsPerDay,
      singleUsePlastics: "medium",
    },
    estimatedCategories: [...ALL],
  };
}
