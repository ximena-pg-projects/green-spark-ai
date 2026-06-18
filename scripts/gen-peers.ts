// scripts/gen-peers.ts
// Generates data/peers.json — a synthetic distribution of ~40 peer schools used
// for percentile ranking in lib/benchmarks.ts. Fully DETERMINISTIC (no random),
// so the file is reproducible and the Data Disclosure can explain exactly how it
// was made: each metric is spread 0.6×–1.8× around its benchmark median, with a
// different stride per metric so the categories aren't perfectly correlated.
// Run:  npx tsx scripts/gen-peers.ts
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const N = 40;
const MED = { energy: 10.5, water: 2500, waste: 0.6, transport: 350, food: 0.12 };
const STRIDE = { energy: 7, water: 11, waste: 13, transport: 17, food: 19 };

const round = (n: number, d: number) => {
  const f = 10 ** d;
  return Math.round(n * f) / f;
};

// Deterministic 0..1 position from an index + a co-prime stride.
const pos = (i: number, stride: number) => ((i * stride) % N) / (N - 1);
// Spread 0.5×–1.5× the benchmark median, so peers are centered ON the median
// (deviation-vs-median agrees with peer percentile) with a realistic ±50% range.
const spread = (median: number, i: number, stride: number) =>
  median * (0.5 + 1.0 * pos(i, stride));

const peers = Array.from({ length: N }, (_, i) => ({
  id: `peer-${String(i + 1).padStart(2, "0")}`,
  students: 600 + ((i * 47) % 1800),
  energyKwhPerSqft: round(spread(MED.energy, i, STRIDE.energy), 1),
  waterGalPerStudent: Math.round(spread(MED.water, i, STRIDE.water)),
  wasteLbPerStudentDay: round(spread(MED.waste, i, STRIDE.waste), 2),
  transportKgPerStudent: Math.round(spread(MED.transport, i, STRIDE.transport)),
  foodWasteLbPerStudentDay: round(spread(MED.food, i, STRIDE.food), 2),
}));

const here = dirname(fileURLToPath(import.meta.url));
writeFileSync(
  join(here, "../data/peers.json"),
  JSON.stringify(peers, null, 2) + "\n",
);
console.log(`Wrote ${peers.length} peer schools to data/peers.json`);
