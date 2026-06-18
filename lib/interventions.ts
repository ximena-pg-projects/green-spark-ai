// lib/interventions.ts
// ROI library. The detective SELECTS fixes from this list instead of inventing
// them — each carries a typical saving (as a fraction of that category's annual
// cost), a payback range, and a cited source. This keeps the recommendations'
// dollar figures grounded rather than hallucinated.

import type { CategoryKey } from "./schema";

export interface Intervention {
  id: string;
  category: CategoryKey;
  action: string;
  /** Typical annual saving as a fraction of that category's annual cost. */
  savingsPctOfCategory: number;
  /** [minMonths, maxMonths]; [0, 0] means immediate / no payback needed. */
  paybackMonths: [number, number];
  co2Note: string;
  quickWin?: boolean;
  source: string;
}

export const INTERVENTIONS: Intervention[] = [
  {
    id: "led",
    category: "energy",
    action: "Retrofit remaining fluorescent/incandescent lighting to LED",
    savingsPctOfCategory: 0.12,
    paybackMonths: [12, 30],
    co2Note: "Cuts lighting electricity by roughly half",
    source: "DOE LED retrofit benchmarks",
  },
  {
    id: "monitors-off",
    category: "energy",
    action: "Power down computer-lab monitors and PCs overnight",
    savingsPctOfCategory: 0.03,
    paybackMonths: [0, 0],
    co2Note: "Eliminates overnight phantom electricity load",
    quickWin: true,
    source: "ENERGY STAR plug-load guidance",
  },
  {
    id: "solar",
    category: "energy",
    action: "Install rooftop solar sized to ~20% of annual electricity load",
    savingsPctOfCategory: 0.18,
    paybackMonths: [60, 96],
    co2Note: "Offsets grid electricity with on-site generation",
    source: "NREL school solar payback ranges",
  },
  {
    id: "lowflow",
    category: "water",
    action: "Replace toilets and faucets with low-flow fixtures",
    savingsPctOfCategory: 0.2,
    paybackMonths: [18, 36],
    co2Note: "Cuts water use by about a quarter",
    source: "EPA WaterSense",
  },
  {
    id: "irrigation",
    category: "water",
    action: "Add a smart irrigation controller and reduce field watering",
    savingsPctOfCategory: 0.1,
    paybackMonths: [6, 18],
    co2Note: "Trims outdoor water waste",
    quickWin: true,
    source: "EPA WaterSense outdoor",
  },
  {
    id: "recycle",
    category: "waste",
    action: "Expand recycling to every classroom and the cafeteria",
    savingsPctOfCategory: 0.15,
    paybackMonths: [0, 6],
    co2Note: "Diverts tonnage from landfill",
    quickWin: true,
    source: "EPA WARM",
  },
  {
    id: "compost",
    category: "waste",
    action: "Start cafeteria composting for organic waste",
    savingsPctOfCategory: 0.1,
    paybackMonths: [6, 18],
    co2Note: "Keeps food scraps out of landfill methane",
    source: "EPA WARM composting",
  },
  {
    id: "no-idle",
    category: "transportation",
    action: "Enforce a no-idling policy at pickup and dropoff",
    savingsPctOfCategory: 0.06,
    paybackMonths: [0, 0],
    co2Note: "Removes wasted idle diesel burn",
    quickWin: true,
    source: "EPA Clean School Bus idle-reduction",
  },
  {
    id: "routes",
    category: "transportation",
    action: "Optimize bus routes to cut total fleet miles",
    savingsPctOfCategory: 0.1,
    paybackMonths: [0, 6],
    co2Note: "Fewer miles means less diesel burned",
    source: "DOE school-transport routing studies",
  },
  {
    id: "meatless",
    category: "food",
    action: "Add a weekly plant-forward / meatless menu day",
    savingsPctOfCategory: 0.05,
    paybackMonths: [0, 0],
    co2Note: "Lower-carbon meals one day a week",
    quickWin: true,
    source: "Project Drawdown plant-rich diets",
  },
  {
    id: "waste-tracking",
    category: "food",
    action: "Track plate waste and right-size cafeteria portions",
    savingsPctOfCategory: 0.15,
    paybackMonths: [0, 6],
    co2Note: "Less over-production and plate waste",
    source: "WWF Food Waste Warriors",
  },
];

export function interventionsFor(categories: CategoryKey[]): Intervention[] {
  return INTERVENTIONS.filter((i) => categories.includes(i.category));
}
