// scripts/smoke-packet.ts
// Sanity check for Layer 2 (benchmarks + confidence). No Claude call — just the
// deterministic evidence packet. Run:  npx tsx scripts/smoke-packet.ts
import school from "../data/school.json";
import { buildEvidencePacket } from "../lib/benchmarks";
import type { SchoolData } from "../lib/schema";

const ev = buildEvidencePacket(school as unknown as SchoolData);

console.log(
  `\n${ev.profile.name} — confidence ${ev.confidenceLevel} (${ev.completenessScore}% complete)`,
);
console.log(`Missing categories: ${ev.missingCategories.join(", ") || "none"}`);
console.log(
  `Totals: ${(ev.totals.annualCo2eKg / 1000).toFixed(1)} t CO2e  $${ev.totals.annualCostUsd.toLocaleString()}\n`,
);
for (const c of ev.categories) {
  const dev = `${c.deviationPct! >= 0 ? "+" : ""}${c.deviationPct}%`;
  console.log(
    `${c.category.padEnd(15)} dev ${dev.padStart(5)}  peer pct ${String(c.peerPercentile).padStart(3)}  ${c.anomalyFlag ?? ""}`,
  );
}
console.log("");
