# Typography, Spacing, and School Voice Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the heavy display typography, correct spacing rhythm across both routes, and reframe the interface around our school without changing product logic.

**Architecture:** Update the shared type and spacing tokens first, then apply them to shared chrome, landing compositions, and dashboard modules. Keep all data flow and component props intact; validate the narrative and visual rules through an expanded static UI contract plus rendered desktop inspection.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, Afacad via `next/font/google`, Geist Mono, Motion, GSAP ScrollTrigger, Recharts.

---

### Task 1: Extend the UI contract

**Files:**
- Modify: `scripts/smoke-ui.mjs`

- [ ] **Step 1: Add failing typography and narrative assertions**

```js
const layout = await readFile("app/layout.tsx", "utf8");
const analyze = await readFile("app/analyze/page.tsx", "utf8");
const flagship = await readFile("lib/flagship.ts", "utf8");

assert(layout.includes("Afacad"), "Afacad must be the primary family");
assert(page.includes("Our school"), "landing page must use collective school voice");
assert(page.includes("Explore our school"), "primary CTA must use school-owned framing");
assert(!analyze.includes("Maya Reyes"), "dashboard must not use the fictional hero narrative");
assert(!flagship.includes("Principal Alvarez"), "flagship metadata must not use a fictional principal");
assert(css.includes("--space-section"), "shared spacing tokens are required");
```

- [ ] **Step 2: Run the contract and confirm it fails for the new requirements**

Run: `node scripts/smoke-ui.mjs`

Expected: FAIL on the Afacad assertion before any production change.

### Task 2: Replace the type and spacing foundation

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Load Afacad and simplify font roles**

```tsx
import { Afacad, Geist_Mono } from "next/font/google";

const sans = Afacad({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
```

Use the Afacad variable for both display and body roles. Keep Geist Mono for technical labels only.

- [ ] **Step 2: Add semantic spacing tokens and calmer typography utilities**

```css
:root {
  --space-tight: 0.75rem;
  --space-control: 1rem;
  --space-panel: 1.5rem;
  --space-group: 2rem;
  --space-section: 3rem;
  --space-macro: 6rem;
}

body { font-family: var(--font-sans); font-size: 1rem; line-height: 1.55; }
h1, h2, h3 { text-wrap: balance; }
p { text-wrap: pretty; }
```

Update `--font-display` and `--font-sans` to Afacad. Remove the Archivo Black and Hanken references.

- [ ] **Step 3: Run the UI contract**

Run: `node scripts/smoke-ui.mjs`

Expected: Afacad passes; school voice and spacing assertions still fail until later tasks.

### Task 3: Reframe the school narrative

**Files:**
- Modify: `lib/flagship.ts`
- Modify: `app/page.tsx`
- Modify: `components/CaseWalkthrough.tsx`
- Modify: `app/analyze/page.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace fictional flagship metadata**

```ts
export const FLAGSHIP = {
  perspective: {
    name: "Our school community",
    role: "students, staff, and decision-makers",
    goal: "understand our footprint and choose the changes worth making next",
  },
  problem: "We know our school can use energy, water, food, and materials more wisely. We need one clear view of where our impact comes from, what it costs, and which changes are worth making first.",
  dataNote: "This view uses our school profile with entered figures where available and clearly labeled benchmark estimates everywhere else. Estimated consumption is not presented as measured data.",
  dataBadge: "Our school profile",
} as const;
```

- [ ] **Step 2: Rewrite the landing entry point**

Use “Our school, clearly seen.” as the hero. Rename the action to “Explore our school.” Supporting copy should say: “A clear view of our footprint, the cost behind it, and the changes worth making next.”

- [ ] **Step 3: Rewrite the investigation sequence**

Change the section framing to “How we understand our school.” Rewrite steps in collective voice while preserving their factual meaning and existing icons/images.

- [ ] **Step 4: Rewrite the analysis arrival and student view**

Use “Our school’s environmental view” for the dashboard frame. Remove visible references to Maya Reyes and Principal Alvarez. Keep the school name, data source labels, and data honesty text.

- [ ] **Step 5: Run the UI contract**

Run: `node scripts/smoke-ui.mjs`

Expected: typography and narrative assertions pass; spacing token assertion passes after Task 2.

### Task 4: Correct landing-page spacing and hierarchy

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/CaseWalkthrough.tsx`
- Modify: `components/brand.tsx`

- [ ] **Step 1: Rebalance the hero**

Use the twelve-column grid with a calmer 7/5 split. Reduce headline weight, increase space between metadata and headline, constrain the body to 55ch, and keep the CTA group at least 32px from supporting text and the viewport edge.

- [ ] **Step 2: Normalize landing section rhythm**

Use 96px desktop section padding, 64px major internal separation, 32px group separation, and 12 to 16px tight relationships. Remove one-off gaps that fall outside the scale unless required for optical alignment.

- [ ] **Step 3: Refine the pinned investigation stage**

Increase breathing room around the stage title, keep each step body below 60ch, align photo and copy panels, and ensure the progress rail does not crowd the supporting paragraph.

- [ ] **Step 4: Refine proof and intake sections**

Align image, headline, module grid, form labels, inputs, supporting facts, and submit action to the same column edges. Preserve all form handlers and validation.

### Task 5: Correct dashboard spacing and hierarchy

**Files:**
- Modify: `app/analyze/page.tsx`
- Modify: `components/ConfidenceMeter.tsx`
- Modify: `components/ImpactCard.tsx`
- Modify: `components/PeerGauge.tsx`
- Modify: `components/RebateBadge.tsx`
- Modify: `components/UsageEntry.tsx`
- Modify: `components/WhatIfSimulator.tsx`

- [ ] **Step 1: Normalize dashboard group spacing**

Use 24px between tightly related modules, 32px between normal dashboard groups, and 48px before major narrative sections. Keep one consistent outer gutter.

- [ ] **Step 2: Normalize panel interiors**

Use 24px padding for standard panels and 32px for major verdict, peer, and simulator sections. Align labels, headings, values, and controls to a shared baseline.

- [ ] **Step 3: Improve dashboard typography**

Use sentence-case Afacad headings at 600 weight, readable 16px body copy, and reserved uppercase mono labels. Remove aggressive uppercase display styling from school names, verdicts, and section headings.

- [ ] **Step 4: Verify unchanged behavior**

Open `/analyze`, toggle data source and student/admin modes, adjust simulator controls, and confirm values and charts still update.

### Task 6: Update design documentation

**Files:**
- Modify: `PRODUCT.md`
- Modify: `DESIGN.md`

- [ ] **Step 1: Record school-owned voice**

Update PRODUCT.md to describe the school community as the narrative owner and remove the outside case-file framing.

- [ ] **Step 2: Record Afacad and the spacing scale**

Update DESIGN.md with Afacad roles, sentence-case hierarchy, mono restrictions, and the six semantic spacing tokens.

### Task 7: Visual and automated verification

**Files:**
- Modify: UI files above only when verification exposes a defect.

- [ ] **Step 1: Run automated checks**

```bash
node scripts/smoke-ui.mjs
npm run lint
npx tsc --noEmit
npm run build
git diff --check
```

Expected: all commands exit 0 after the teammate OpenAI dependency merge.

- [ ] **Step 2: Inspect 1280×800 and 1440×900**

Capture both routes at both desktop sizes. Check headline wrapping, outer gutters, panel spacing, form alignment, dense dashboard regions, and lower-page rhythm.

- [ ] **Step 3: Complete one critique-and-fix pass**

Fix any remaining crowded edges, stranded whitespace, uneven section transitions, weak hierarchy, or copy that slips back into outside case-file language.

- [ ] **Step 4: Re-run the automated checks**

Run the full command set from Step 1 after final visual patches.
