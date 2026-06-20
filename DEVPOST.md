# Green Spark AI — Devpost submission fields

Paste-ready answers for each Devpost field. Edit the bracketed parts before submitting.

---

## Qualifier Approval Code

`[your 8-character code, e.g. XX26-Q7H9K2M1]`

## Track & Challenge Selection

High School Track · Challenge Brief 2, "Make Climate Action Local and Real" · Direction B: My School's Hidden Footprint.

## Project Description

Green Spark AI is an "Environmental AI Detective" for one specific school and one specific person. The user is Maya Reyes, the Green Team lead at Mesa Verde High School in Austin, TX. Maya knows the school wastes energy, water, and food, but she has never seen the building's numbers in one place, and she cannot walk into the principal's office with a vague feeling.

Green Spark AI starts from the school's profile, turns its everyday numbers into a footprint, finds where the school is unusually wasteful compared to similar schools, and hands Maya a ranked, costed action plan she can pitch. Every recommendation comes with an estimated dollar saving, a payback time, and a matching local rebate (for example, an Austin Energy lighting rebate or the federal solar tax credit). A what-if simulator lets her drag levers and watch the carbon and cost fall in real time, and a student-pitch view reframes the same analysis into three talking points for the principal.

The flow is input → AI → insight → action: enter a profile (or full usage data), the AI ranks and explains, the dashboard shows the costed plan, and the simulator turns it into something the school can actually do.

## AI Architecture Explanation

A three-layer reasoning pipeline, not a chatbot on a chart.

- **Inputs.** A school profile (size, enrollment, location, grid region) plus tiered usage data per category (energy, water, waste, transportation, food). If the user has only the profile, benchmark autofill estimates every category from published medians, so the tool works with no private data.
- **AI capabilities used.** Estimation (benchmark autofill), anomaly and benchmark detection (each category vs. a peer distribution), recommendation (selecting and ranking ROI fixes), predictive modeling (a 12-month before/after projection), and generative explanation (plain-language insights and a verdict from Claude).
- **Processing.**
  1. *Calc engine (deterministic TypeScript):* inputs → annual CO2 and cost per category, using cited EPA, EIA, and DOE factors. The AI never invents the headline numbers.
  2. *Pattern detection (deterministic):* compare each category to a benchmark and ~40 peer schools, flag anomalies, compute a peer percentile, and score data completeness into a confidence level.
  3. *Detective (Claude, `claude-sonnet-4-6`):* reads that computed evidence packet, ranks the top three impacts, chooses fixes from a fixed intervention library, references matching local rebates, honors the confidence gate, and writes the explanations. Output is forced into a strict schema via a single tool call and validated with Zod.
- **Outputs.** A ranked, costed action plan (saving + payback + CO2 per fix), a zero-budget quick win per area, a peer benchmark gauge, a live what-if simulator with a 12-month projection, and a confidence level with a plain explanation of what is uncertain.

## Human-in-Loop Design

The AI does not decide what to spend money on or approve any capital project. It estimates and recommends; every dollar figure is labeled an estimate to confirm with a real vendor quote, and a human (facilities or administration) verifies the quote and approves the purchase. This is surfaced on every recommendation card and in the detective's verdict. We keep the human in control here because the figures are estimates from benchmark factors, not bids, and a wrong purchase wastes a school's limited budget.

## Responsible AI Guardrail

- **Risk:** the detective could give confident, specific advice from sparse or estimated data and send a school down the wrong path (over-reliance on misleading conclusions).
- **Mitigation:** a data-completeness confidence gate. The tool scores how complete the data is, weights benchmark-estimated categories below entered ones, and ties the detective's stated certainty to that score. A profile-only autofill reads Low confidence (about 20%) and the detective names exactly which categories are estimates and asks for real numbers, instead of presenting a guess as a fact. Every figure is labeled with its source. You can flip "Full data" and "Profile-only estimate" on the dashboard and watch confidence drop from High to Low.

## Tools Used

- Next.js, React, Tailwind CSS, Recharts, Zod, TypeScript — free / open source.
- Anthropic Claude API via CometAPI  (`claude-sonnet-4-6`) for the detective layer — paid, low cost. The app runs without it via a deterministic offline fallback.
- Vercel for hosting — free tier.
- AI coding assistance: Claude Code was used to help build the project (disclosed per the rules). Per the brief, paid tools are not an advantage; the reasoning and design are ours.

## Data Disclosure

The flagship school is a representative profile of a mid-size Austin, TX high school. Its profile (size, enrollment, location, grid region) is realistic, and its consumption figures are synthetic estimates drawn from published benchmark ranges and clearly labeled as estimates in the UI. Emission and cost factors come from EPA eGRID, the EPA GHG Emission Factors Hub, EPA WARM, EIA electricity prices and CBECS building intensities, and DOE/NREL figures, each tied to a source string in `lib/factors.ts`. Peer schools (~40) are synthetic, seeded to span realistic ranges for percentile ranking. Rebate programs are a curated set of real Austin, Texas, and federal incentives. No private school data is required for the tool to function.

## 3–5 Minute Pitch Video (outline)

1. **Problem and user (0:00–0:45).** Maya at Mesa Verde: cares, but has no numbers and no way to prioritize.
2. **How the AI works (0:45–2:00).** Walk the three layers: calc engine → anomaly + peer detection → Claude ranks and explains. Stress that the AI reasons over computed numbers it did not invent.
3. **Live walkthrough (2:00–4:00).** Open the case file, show the ranked impacts with savings and local rebates, drag the what-if simulator and watch the 12-month projection fall, flip to the student-pitch view.
4. **Responsible AI choice (4:00–4:45).** Toggle Full data → Profile-only and show confidence drop to Low and the detective admitting what it cannot know; note the AI never approves spending.

## Working Demo

Live dashboard at `[your Vercel URL]`. Local: `npm run dev`, then open `/analyze` for the flagship demo or use the landing intake to analyze any school profile.
