// scripts/smoke-detective-local.ts
// Sanity check for the deterministic offline detective (no Claude call). Run:
//   npx tsx scripts/smoke-detective-local.ts
import school from "../data/school.json";
import { buildEvidencePacket } from "../lib/benchmarks";
import { runLocalDetective } from "../lib/localDetective";
import type { SchoolData } from "../lib/schema";

const ev = buildEvidencePacket(school as unknown as SchoolData);
const out = runLocalDetective(ev);

console.log(
  `\n${ev.profile.name} — confidence ${out.confidence_level}\n${out.confidence_explanation}\n`,
);
for (const t of out.top_impacts) {
  console.log(`#${t.rank} ${t.category}  (impact ${t.impact_score}/100)`);
  console.log(`   ${t.detective_insight}`);
  for (const r of t.recommendations) {
    console.log(
      `   • ${r.action}\n     ${r.estimated_annual_savings} · ${r.payback_period}`,
    );
  }
  console.log(`   quick win: ${t.quick_win}\n`);
}
console.log(`VERDICT: ${out.overall_verdict}\n`);
