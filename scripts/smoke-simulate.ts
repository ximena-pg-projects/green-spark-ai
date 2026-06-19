// scripts/smoke-simulate.ts
// Sanity-checks lib/simulate.ts against the real school.json: a baseline
// run, a single intervention, a stacked-category run, an over-100% stack
// (should cap + warn), and an unknown id (should warn, not throw).
import school from "../data/school.json";
import { simulate } from "../lib/simulate";
import type { SchoolData } from "../lib/schema";

const data = school as SchoolData;

function section(title: string) {
  console.log(`\n=== ${title} ===`);
}

section("Baseline (no interventions)");
const baseline = simulate(data, []);
console.log("totals:", baseline.baseline.totals);
console.log("delta (should be ~0):", baseline.delta);

section("Single intervention: LED retrofit");
const led = simulate(data, ["led"]);
const energyBefore = led.categories.find((c) => c.category === "energy");
console.log("energy baseline:", energyBefore?.baseline);
console.log("energy projected:", energyBefore?.projected);
console.log("applied:", energyBefore?.applied);
console.log("total delta:", led.delta);
console.log("immediate annual savings:", led.immediateAnnualSavingsUsd);
console.log("combined payback range:", led.combinedPaybackMonthsRange);

section("Stacked, same category: LED + monitors-off + solar (energy)");
const stacked = simulate(data, ["led", "monitors-off", "solar"]);
const energyStacked = stacked.categories.find((c) => c.category === "energy");
console.log("energy baseline cost:", energyStacked?.baseline?.annualCostUsd);
console.log("energy projected cost:", energyStacked?.projected?.annualCostUsd);
console.log(
  "sum of per-intervention cost deltas:",
  energyStacked?.applied.reduce((s, a) => s + a.costDeltaUsd, 0),
);
console.log("combined payback range:", stacked.combinedPaybackMonthsRange);
console.log("immediate annual savings:", stacked.immediateAnnualSavingsUsd);

section("Cross-category stack: LED (energy) + recycle (waste) + no-idle (transportation)");
const cross = simulate(data, ["led", "recycle", "no-idle"]);
console.log("baseline totals:", cross.baseline.totals);
console.log("projected totals:", cross.projected.totals);
console.log("delta:", cross.delta);
console.log("warnings:", cross.warnings);

section("Repeated id stacks additively (no de-dupe by design)");
const repeated = simulate(data, ["lowflow", "irrigation", "lowflow"]); // 0.2 + 0.1 + 0.2 = 0.5, under cap
const waterRepeated = repeated.categories.find((c) => c.category === "water");
console.log("water baseline cost:", waterRepeated?.baseline?.annualCostUsd);
console.log("water projected cost (expect 50% off, no cap/warning):", waterRepeated?.projected?.annualCostUsd);
console.log("warnings (expect none):", repeated.warnings);

section("Forced over-100% stack in one category (should cap at 100% + warn)");
// Current library maxes out around 30-35% per category with real ids, so
// stress the cap directly by repeating a high-savingsPct id enough times.
const overstack = simulate(data, ["lowflow", "lowflow", "lowflow", "lowflow", "lowflow", "lowflow"]); // 6 x 0.2 = 1.2 (120%)
const waterOver = overstack.categories.find((c) => c.category === "water");
console.log("water baseline cost:", waterOver?.baseline?.annualCostUsd);
console.log("water projected cost (expect $0, fully capped):", waterOver?.projected?.annualCostUsd);
console.log("warnings (expect a cap warning):", overstack.warnings);

section("Unknown intervention id (should warn, not throw)");
const unknown = simulate(data, ["led", "made-up-id"]);
console.log("warnings:", unknown.warnings);
console.log("delta still computed:", unknown.delta);

section("Requested intervention for a category with no baseline data");
const noProfileSchool: SchoolData = { profile: data.profile }; // strip all categories
const noBaseline = simulate(noProfileSchool, ["led"]);
console.log("warnings:", noBaseline.warnings);
console.log("baseline totals (should be 0,0):", noBaseline.baseline.totals);
