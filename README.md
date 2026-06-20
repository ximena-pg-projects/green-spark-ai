# Green Spark AI

An Environmental AI Detective for schools. It turns a school's everyday numbers into a short, costed action plan: where the biggest impacts are, what they cost, and what to do about them this week.

Built for the USAII Global AI Hackathon 2026, Challenge Brief 2 (Make Climate Action Local and Real), High School track.

## The problem we're trying to fix

A lot of people care about the environment but never get to act on it at the places they actually spend their days. A school is a good example. It wants to cut waste and save money, but the people who could push for that, a student in the eco club, a teacher, someone in the front office, almost never have the building's energy, water, waste, and transportation numbers in front of them. Even when they do, it's a wall of figures with no sense of which one matters most or what fixing it would cost. Good intentions stall right there, and "we should do something" never becomes "we did."

Green Spark AI is built to close that gap: make a school's footprint visible, point at the few things worth acting on, and put a dollar figure and a payback time on each one so it's easy to make the case to whoever holds the budget.

## How it works, and the thinking behind it

The core is a reasoning pipeline rather than a chatbot sitting on top of a bar chart. There are three layers:

1. **Calc engine (Layer 1).** Pure TypeScript converts inputs into annual CO2 and cost using published EPA, DOE, and EIA factors, each one tied to a source. The AI never makes up the headline numbers.
2. **Pattern detection (Layer 2).** Each category is compared to a benchmark and to a set of peer schools, anything that stands out is flagged, and the data is scored for how complete it is.
3. **The detective (Layer 3, Claude).** It reads that computed evidence, ranks the biggest impacts, and selects fixes from a small library of real interventions so the savings and payback are grounded, not guessed.

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

Next up:

- [ ] Add `ANTHROPIC_API_KEY` to `.env.local` so the dashboard shows live Claude analysis (without it, the offline fallback runs)
- [x] Use Hanover High School public data as the flagship profile (`data/school.json` + `lib/flagship.ts`)
- [ ] Deploy to Vercel and set the key in the project env
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

The detective itself calls Claude and needs an Anthropic API key, which is deferred for now. When you're ready:

```bash
cp .env.local.example .env.local  # add ANTHROPIC_API_KEY (stays server-side only)
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
  detective.ts           Layer 3: the Claude call (structured output)
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

- **Risk:** the detective could give confident, specific advice from sparse data and send a school down the wrong path.
- **Mitigation:** the confidence gate lowers how certain it sounds when data is thin and names what is uncertain, and every figure is labeled with its source.
- **Human in the loop:** the AI estimates and recommends, it does not decide what to spend. The numbers are estimates to confirm with a real quote, and a person approves any purchase.

## Data note

The demo school is synthetic and clearly labeled. A real school can use real public profile data (enrollment, size, location) with consumption estimated from published benchmark ranges, or real figures where a city publishes them. No private data is required for the tool to work.
