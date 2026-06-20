// lib/theme.ts
// Single source of truth for category presentation: label, short code, the
// hex used by Recharts (SVG fills want a literal color), and the CSS token used
// everywhere else. Keeps the dashboard, simulator, and cards in lockstep.

import type { CategoryKey } from "./schema";

export interface CategoryMeta {
  label: string;
  short: string; // 3-letter forensic code, e.g. "ENE"
  hex: string; // literal for Recharts / inline SVG
  cssVar: string; // var(--color-*) for DOM styling
}

export const CATEGORY: Record<CategoryKey, CategoryMeta> = {
  energy: { label: "Energy", short: "ENE", hex: "#19a974", cssVar: "var(--color-energy)" },
  water: { label: "Water", short: "WTR", hex: "#45c0e8", cssVar: "var(--color-water)" },
  waste: { label: "Waste", short: "WST", hex: "#f2b73c", cssVar: "var(--color-waste)" },
  transportation: { label: "Transit", short: "TRN", hex: "#b08cf2", cssVar: "var(--color-transport)" },
  food: { label: "Food", short: "FD", hex: "#f26174", cssVar: "var(--color-food)" },
};

export const CATEGORY_KEYS: CategoryKey[] = [
  "energy",
  "water",
  "waste",
  "transportation",
  "food",
];

// The detective output labels categories with a capitalized display string
// ("Energy"). Map those back to the lowercase keys this file is keyed on.
const LABEL_TO_KEY: Record<string, CategoryKey> = {
  Energy: "energy",
  Water: "water",
  Waste: "waste",
  Transportation: "transportation",
  Food: "food",
};

export function keyFromLabel(label: string): CategoryKey | undefined {
  return LABEL_TO_KEY[label];
}
