// scripts/smoke-usage.ts
// Verifies the "I have the real number" path: entering real headline figures on
// top of a profile-only estimate should graduate those categories out of
// `estimatedCategories` and walk the confidence gate up Low -> Medium -> High.
// Run:
//   npx tsx scripts/smoke-usage.ts
import school from "../data/school.json";
import { estimateFromProfile } from "../lib/estimate";
import { buildEvidencePacket } from "../lib/benchmarks";
import { withRealUsage, getUsageValue } from "../lib/usage";
import type { CategoryKey, SchoolData } from "../lib/schema";

const profile = (school as unknown as SchoolData).profile;
const estimated = estimateFromProfile(profile);

function level(overrides: Partial<Record<CategoryKey, number>>) {
  const packet = buildEvidencePacket(withRealUsage(estimated, overrides));
  return packet;
}

const none = level({});
const oneCat = level({ energy: 1_900_000 });
const threeCat = level({ energy: 1_900_000, transportation: 16, food: 240 });

console.log("\nProfile-only (no real numbers):", none.confidenceLevel, `(${none.completenessScore}%)`);
console.log("  estimated:", none.estimatedCategories.join(", "));
console.log("+ energy entered            :", oneCat.confidenceLevel, `(${oneCat.completenessScore}%)`);
console.log("  estimated:", oneCat.estimatedCategories.join(", "));
console.log("+ energy, transport, food   :", threeCat.confidenceLevel, `(${threeCat.completenessScore}%)`);
console.log("  estimated:", threeCat.estimatedCategories.join(", "), "\n");

// The entered headline value must actually land on the school.
const applied = withRealUsage(estimated, { energy: 1_900_000 });
const ok = getUsageValue(applied, "energy") === 1_900_000;

const climbs =
  none.completenessScore < oneCat.completenessScore &&
  oneCat.completenessScore < threeCat.completenessScore;
const graduates =
  none.estimatedCategories.includes("energy") &&
  !oneCat.estimatedCategories.includes("energy");
const reachesHigh = threeCat.confidenceLevel === "High";

if (!ok) {
  console.error("FAIL: entered value did not land on the school.");
  process.exit(1);
}
if (!climbs) {
  console.error("FAIL: completeness did not climb as real numbers were added.");
  process.exit(1);
}
if (!graduates) {
  console.error("FAIL: an entered category was not removed from estimatedCategories.");
  process.exit(1);
}
if (!reachesHigh) {
  console.error("FAIL: entering the three heaviest categories should reach High.");
  process.exit(1);
}
console.log("PASS: real numbers graduate categories and climb Low -> Medium -> High.\n");
