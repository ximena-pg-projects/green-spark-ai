// lib/schema.ts
// ─────────────────────────────────────────────────────────────────────────────
// THE DAY-1 CONTRACT.
// This file is the shared interface between the two build tracks:
//   • Data+AI track builds calc.ts / benchmarks.ts / api/analyze to PRODUCE these.
//   • Frontend track builds components/ to CONSUME these.
// Lock the shapes here first; then both tracks can move in parallel without
// stepping on each other. Change it deliberately, together.
// ─────────────────────────────────────────────────────────────────────────────

export type CategoryKey =
  | "energy"
  | "water"
  | "waste"
  | "transportation"
  | "food";

export type DataTier = "profile" | "basic" | "advanced";
export type ConfidenceLevel = "Low" | "Medium" | "High";

// ── School profile (baseline the AI benchmarks against) ──────────────────────
export interface SchoolProfile {
  name: string;
  city: string;
  state: string;
  country: string;
  schoolType: "Primary" | "Middle" | "Secondary" | "K-12";
  squareFootage: number | null;
  students: number;
  staff: number;
  /** EPA eGRID code or regional shorthand used for CO2 assumptions. */
  gridRegion?: string;
}

// ── Raw category inputs. Every field is optional — completeness is computed,
//    never required. The demo ships with these pre-filled (zero friction). ────
export interface EnergyInputs {
  monthlyElectricBill?: number; // USD/month (basic)
  primaryHeatingSource?: "natural_gas" | "electric" | "oil" | "propane";
  annualElectricityKwh?: number; // advanced
  annualHeatingFuel?: number; // therms (gas) or gallons (oil)
  heatingFuelUnit?: "therms" | "gallons";
  hasSolar?: boolean;
  solarAnnualKwh?: number;
  ledPercent?: number; // % of lighting that is LED
}

export interface WaterInputs {
  monthlyWaterBill?: number;
  hasIrrigatedField?: boolean;
  annualGallons?: number;
  lowFlowPercent?: number;
  rainwaterHarvesting?: boolean;
  rainwaterGallons?: number;
}

export interface WasteInputs {
  collectionsPerWeek?: number;
  dumpsterSizeYards?: number; // cubic yards
  recycling?: "none" | "partial" | "full";
  annualLandfillTons?: number;
  annualRecycledTons?: number;
  annualCompostTons?: number;
  reamsPaperPerYear?: number;
}

export interface TransportationInputs {
  busCount?: number;
  annualDieselGallons?: number;
  busFuelType?: "diesel" | "electric" | "cng";
  pctWalkBike?: number;
  pctBus?: number;
  pctCar?: number;
  avgTripMilesPerStudent?: number;
  busesIdle?: boolean;
}

export interface FoodInputs {
  providesLunch?: boolean;
  hasMeatFreeOptions?: boolean;
  plateWasteLbsPerDay?: number;
  pctLocalSourcing?: number;
  singleUsePlastics?: "high" | "medium" | "low";
}

export interface SchoolData {
  profile: SchoolProfile;
  energy?: EnergyInputs;
  water?: WaterInputs;
  waste?: WasteInputs;
  transportation?: TransportationInputs;
  food?: FoodInputs;
  /**
   * Categories whose inputs were benchmark-estimated (lib/estimate.ts), not
   * entered by the user. The confidence gate weights these lower so a
   * profile-only autofill lands at Low/Medium confidence, never High.
   */
  estimatedCategories?: CategoryKey[];
}

// ── Layers 1 & 2 output: the "evidence packet" handed to the LLM detective.
//    The LLM reasons OVER these computed numbers; it never invents them. ───────
export interface CategoryEvidence {
  category: CategoryKey;
  tier: DataTier; // best tier of data available for this category
  annualCo2eKg: number; // computed by calc.ts
  annualCostUsd: number; // computed by calc.ts
  intensityMetric?: { label: string; value: number; unit: string };
  benchmark?: { label: string; median: number; unit: string };
  deviationPct?: number; // + above / − below benchmark
  anomalyFlag?: string; // human-readable anomaly note, if any
  peerPercentile?: number; // 0–100 (higher = more intensive / worse)
  sources: string[]; // citations used in this category's calc
}

export interface EvidencePacket {
  profile: SchoolProfile;
  categories: CategoryEvidence[];
  totals: { annualCo2eKg: number; annualCostUsd: number };
  completenessScore: number; // 0–100, impact-weighted fields filled
  confidenceLevel: ConfidenceLevel; // gates the detective's certainty
  missingCategories: CategoryKey[];
  estimatedCategories: CategoryKey[]; // present but benchmark-estimated, not entered
}

// ── Layer 3 output: the detective's structured analysis.
//    Mirrors the JSON contract in detective_prompt.txt exactly. ──────────────
export interface Recommendation {
  action: string;
  estimated_annual_savings: string;
  payback_period: string;
  impact_reduction: string;
}

export interface TopImpact {
  category: "Energy" | "Water" | "Waste" | "Transportation" | "Food";
  rank: number;
  impact_score: number; // 0–100
  detective_insight: string;
  recommendations: Recommendation[];
  quick_win: string;
}

export interface DetectiveOutput {
  confidence_level: ConfidenceLevel;
  confidence_explanation: string;
  top_impacts: TopImpact[];
  overall_verdict: string;
}

// ── The full payload /api/analyze returns and the dashboard renders. ─────────
export interface AnalyzeResponse {
  evidence: EvidencePacket;
  detective: DetectiveOutput;
}
