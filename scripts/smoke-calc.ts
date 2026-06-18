// scripts/smoke-calc.ts
// Quick sanity check for the calc engine. Prints the computed footprint for the
// demo school so we can eyeball that the numbers are realistic.
// Run:  npx tsx scripts/smoke-calc.ts
import school from "../data/school.json";
import { computeFootprint } from "../lib/calc";
import type { SchoolData } from "../lib/schema";

const data = school as unknown as SchoolData;
const fp = computeFootprint(data);

console.log(
  `\nFootprint — ${data.profile.name} (${data.profile.city}, ${data.profile.state})\n`,
);
for (const c of fp.categories) {
  const tonnes = `${(c.annualCo2eKg / 1000).toFixed(1)} t`;
  const cost = `$${c.annualCostUsd.toLocaleString()}`;
  const intensity = c.intensityMetric
    ? `${c.intensityMetric.label}: ${c.intensityMetric.value} ${c.intensityMetric.unit}`
    : "";
  console.log(
    `${c.category.padEnd(15)} ${tonnes.padStart(9)} CO2e ${cost.padStart(11)}  [${c.tier}]  ${intensity}`,
  );
}
console.log("-".repeat(72));
console.log(
  `${"TOTAL".padEnd(15)} ${`${(fp.totals.annualCo2eKg / 1000).toFixed(1)} t`.padStart(9)} CO2e ${`$${fp.totals.annualCostUsd.toLocaleString()}`.padStart(11)}\n`,
);
