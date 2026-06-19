// scripts/smoke-estimate.ts
// Verifies the benchmark-autofill path: profile only -> estimated SchoolData ->
// evidence packet should be LOW/MEDIUM confidence (never High), and the
// detective should name the estimated categories. Run:
//   npx tsx scripts/smoke-estimate.ts
import school from "../data/school.json";
import { estimateFromProfile } from "../lib/estimate";
import { buildEvidencePacket } from "../lib/benchmarks";
import { runLocalDetective } from "../lib/localDetective";
import type { SchoolData } from "../lib/schema";

const full = buildEvidencePacket(school as unknown as SchoolData);
const estimated = estimateFromProfile((school as unknown as SchoolData).profile);
const est = buildEvidencePacket(estimated);

console.log("\nFULL DATA   :", full.confidenceLevel, `(${full.completenessScore}%)`);
console.log("PROFILE ONLY:", est.confidenceLevel, `(${est.completenessScore}%)`);
console.log("estimated categories:", est.estimatedCategories.join(", "));
console.log("\nDetective on the profile-only estimate:");
console.log(" ", runLocalDetective(est).confidence_explanation, "\n");

if (est.confidenceLevel === "High") {
  console.error("FAIL: profile-only autofill must not read as High confidence.");
  process.exit(1);
}
console.log("PASS: autofill lands below High confidence.\n");
