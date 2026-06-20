# Green Spark AI

An Environmental AI Detective built for a school's Eco Club. It turns the school's everyday numbers into a short, costed action plan: where the biggest impacts are, what they cost, and what to do about them this week.

Built for the USAII Global AI Hackathon 2026, Challenge Brief 2 (Make Climate Action Local and Real), High School track.

**Our user, in one sentence (no AI named):** the Hanover High Eco Club wants to cut the school's waste and emissions, but the numbers that would tell them where to start are scattered across utility bills nobody in the club ever sees.

## The problem we're trying to fix

The Eco Club is the group that actually wants to act, and it's the group with the least access to the data. A school wants to cut waste and save money, but the students who would push for that almost never have the building's energy, water, waste, transportation, and food numbers in front of them. Even when they do, it's a wall of figures with no sense of which one matters most or what fixing it would cost. Good intentions stall right there, and "we should do something" never becomes "we did."

Green Spark AI is built to close that gap: make a school's footprint visible, point at the few things worth acting on, and put a dollar figure and a payback time on each one so it's easy to make the case to whoever holds the budget.

## How it works, and the thinking behind it

The core is a reasoning pipeline rather than a chatbot sitting on top of a bar chart. There are three layers:

1. **Calc engine (Layer 1).** Pure TypeScript converts inputs into annual CO2 and cost using published EPA, DOE, and EIA factors, each one tied to a source. The AI never makes up the headline numbers.
2. **Pattern detection (Layer 2).** Each category is compared to a benchmark and to a set of peer schools, anything that stands out is flagged (an early warning when a category drifts above peers), and the data is scored for how complete it is. The what-if engine then forecasts the 12-month trajectory of any change.
3. **The detective (Layer 3, Gemini).** It reads that computed evidence, ranks the biggest impacts, and selects fixes from a small library of real interventions so the savings and payback are grounded, not guessed. Output is forced into a strict JSON schema (Gemini's native structured-output mode) and re-validated before it reaches the UI.

A few choices we made on purpose:

- **Honest about what it knows.** A confidence gate ties how certain the detective sounds to how much real data it has. With thin data it says so and names what it is estimating, instead of stating a guess as a fact.
- **Useful with almost no data.** The demo runs instantly on a pre-loaded school, and a real school can be dropped in using public profile data plus clearly labeled estimates. It does not require any private school records to be useful.
- **Money is the hook.** Every recommendation is framed as savings and payback, because that is what tends to move a school from talking to acting.

## Scope and status

This section is kept current so the scope is always honest.

Built and verified (compiles, lints, smoke-tested):

- [x] Scaffold: Next.js + TypeScript + Tailwind
- [x] Shared data contract (`lib/schema.ts`)
- [x] Layer 1 calc engine (`lib/factors.ts`, `lib/calc.ts`)
- [x] Layer 2 benchmarks, peer percentiles, confidence gate (`lib/benchmarks.ts`, `data/peers.json`)
- [x] Intervention ROI library (`lib/interventions.ts`)
- [x] AI detective and serverless route (`lib/detective.ts`, `lib/detectivePrompt.ts`, `app/api/analyze/route.ts`)
- [x] Named flagship school + hero user (`data/school.json`, `lib/flagship.ts`)
- [x] Results dashboard wired to `/api/analyze`, with a deterministic offline fallback so a live demo never blanks out (`app/analyze/page.tsx`, `lib/localDetective.ts`)
- [x] Confidence meter, ranked impact cards, peer gauge, student-pitch toggle (`components/`)
- [x] What-if simulator + 12-month projection, recomputing client-side (`lib/simulate.ts`, `components/WhatIfSimulator.tsx`, `components/ProjectionChart.tsx`, `app/api/simulate/route.ts`)
- [x] Benchmark autofill + Low-confidence path (`lib/estimate.ts`) and a working profile intake on the landing page
- [x] Dashboard real-number entry: type a real usage figure (from the bill / front office) and that category graduates from estimate to measured, climbing the confidence meter Low → Medium → High (`lib/usage.ts`, `components/UsageEntry.tsx`)
- [x] Local + federal rebates matched to each fix (`data/rebates.json`, `lib/rebates.ts`, `components/RebateBadge.tsx`)

- [x] Live Gemini detective wired to the dashboard behind `NEXT_PUBLIC_ENABLE_AI`, firing only on load and on Re-run to respect free-tier limits (`lib/detective.ts`)

Next up:

- [ ] Deploy to Vercel and set `GEMINI_API_KEY` + `NEXT_PUBLIC_ENABLE_AI=1` in the project env
- [ ] Record the 3–5 minute pitch video

Out of scope: utility-bill photo upload, dropped for privacy (uploading a real bill is exactly the kind of private data the brief warns against).

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

You can sanity-check the engine with no API key:

```bash
npx tsx scripts/smoke-calc.ts     # prints the footprint (CO2 + cost per category)
npx tsx scripts/smoke-packet.ts   # prints anomalies, peer percentiles, confidence
```

The detective calls Google Gemini and needs a free Gemini API key:

```bash
cp .env.local.example .env.local  # add GEMINI_API_KEY (stays server-side only)
                                  # and keep NEXT_PUBLIC_ENABLE_AI=1
```

Then POST a school to the endpoint:

```bash
curl -s -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" --data @data/school.json
```

## Project layout

```
app/
  page.tsx               landing + working profile intake (autofill -> analyze)
  analyze/page.tsx       results dashboard (calls /api/analyze, fallback offline)
  api/analyze/route.ts   serverless: school -> evidence -> detective -> JSON
  api/simulate/route.ts  pure what-if math + intervention catalog (no LLM)
lib/
  schema.ts              shared types (the contract between data and UI)
  flagship.ts            the demo's named school + hero-user narrative
  factors.ts             emission + cost factors, each with a source
  calc.ts                Layer 1: inputs -> CO2 + cost (pure, runs client too)
  estimate.ts            benchmark autofill: profile -> full estimated inputs
  usage.ts               "I have the real number" overrides -> graduate a category
  benchmarks.ts          Layer 2: anomalies, peer percentile, confidence gate
  interventions.ts       ROI library the detective chooses fixes from
  rebates.ts             local/federal incentives matched to fixes
  detectivePrompt.ts     the detective's system prompt
  detective.ts           Layer 3: the Gemini call (structured JSON output)
  localDetective.ts      deterministic offline detective (demo-safe fallback)
  simulate.ts            what-if engine (pure; powers the simulator)
components/              ConfidenceMeter, ImpactCard, PeerGauge, RebateBadge,
                         WhatIfSimulator, ProjectionChart, UsageEntry
data/
  school.json            flagship demo school (swap for a real one)
  peers.json             synthetic peer schools for percentile ranking
  rebates.json           curated local + federal incentive programs
scripts/                 gen-peers + smoke tests (calc, packet, simulate,
                         detective-local, estimate, usage)
```

## Responsible AI

Stated the way the judges ask for it — failure mode, who is harmed, the design choice:

- **The failure mode:** the detective could give confident, specific advice from thin data and send the club chasing the wrong fix.
- **Who it harms:** a school with a tight facilities budget spends it on the wrong retrofit, and the Eco Club loses credibility with the staff who hold the budget for next time.
- **The design choice (the guardrail):** a confidence gate ties how certain the analysis sounds to how much real data backs it; every estimated figure is labeled as an estimate, not a measurement; and the detective never recomputes or invents a headline number — it reasons only over the cited calc-engine output.
- **Human in the loop:** the AI estimates and recommends, it does not decide what to spend. Every dollar figure is an estimate to confirm with a vendor quote, and a person approves any purchase.

## Data note

The flagship is Hanover High School, built from public data and clearly labeled. Building square footage is not public (energy-intensity benchmarking is marked audit-needed), and cafeteria food waste is not separately metered, so it is estimated from EPA WARM benchmarks for a school this size and labeled as an estimate. Any other school can use real public profile data (enrollment, size, location) with consumption estimated from published benchmark ranges, or real figures where a city publishes them. No private student data is required for the tool to work.
