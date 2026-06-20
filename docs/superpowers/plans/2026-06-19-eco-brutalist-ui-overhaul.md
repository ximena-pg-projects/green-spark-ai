# Eco-Brutalist UI Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Green Spark AI landing page and analysis dashboard as a botanical eco-brutalist campaign while preserving all current product behavior.

**Architecture:** Establish one shared token and chrome layer, then rebuild the landing-page compositions and reskin the existing dashboard modules without altering their props or data flow. Local documentary imagery and one bounded ambient WebGL field provide the visual atmosphere; GSAP owns the single pinned narrative sequence and Motion owns local state/reveal transitions.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, Motion, GSAP ScrollTrigger, Recharts, Phosphor Icons, next/image.

---

### Task 1: Add the UI contract smoke test

**Files:**
- Create: `scripts/smoke-ui.mjs`

- [ ] **Step 1: Write the failing UI contract**

```js
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const page = await readFile("app/page.tsx", "utf8");
const fx = await readFile("components/fx.tsx", "utf8");
const css = await readFile("app/globals.css", "utf8");

assert(!page.includes("<Magnetic"), "primary CTA must not move magnetically");
assert(!fx.includes('addEventListener("pointermove"'), "shader must not follow the cursor");
assert(css.includes("--color-botanical"), "botanical design token is required");

for (const file of [
  "public/images/school-campus.webp",
  "public/images/solar-array.webp",
  "public/images/student-action.webp",
]) await access(file);

console.log("UI contract smoke test passed");
```

- [ ] **Step 2: Run the contract and confirm the baseline fails**

Run: `node scripts/smoke-ui.mjs`

Expected: FAIL because the magnetic wrapper, pointer listener, botanical token, and local images have not been replaced yet.

- [ ] **Step 3: Keep the contract failing while later tasks implement each requirement**

No production code changes belong in this task.

### Task 2: Capture project design context and source imagery

**Files:**
- Create: `PRODUCT.md`
- Create: `public/images/school-campus.webp`
- Create: `public/images/solar-array.webp`
- Create: `public/images/student-action.webp`

- [ ] **Step 1: Write the approved product context**

```markdown
# Product

## Register
brand

## Users
Student advocates and school stakeholders using a laptop or classroom display to understand and communicate a school's environmental footprint.

## Product Purpose
Turn school profile and usage data into credible emissions evidence and a ranked, fundable action plan.

## Brand Personality
Urgent, botanical, evidentiary.

## Anti-references
Generic rounded SaaS dashboards, decorative glassmorphism, timid sustainability branding, cursor-following glow, and motion that makes primary actions drift.

## Design Principles
Make evidence impossible to ignore. Connect every visual flourish to a real school outcome. Keep dense analysis legible. Use motion to explain sequence and state. Prefer documentary proof over abstract decoration.

## Accessibility & Inclusion
Maintain visible focus, semantic structure, readable contrast, and complete reduced-motion fallbacks.
```

- [ ] **Step 2: Verify and download three documentary photographs**

Use authoritative photo pages with usable high-resolution downloads. Save local working images in `/tmp`, then convert them with Sharp to WebP at widths appropriate for the hero and narrative panels.

Expected: each final asset is local, opens correctly, and is no larger than necessary for a 1600 to 2000 pixel desktop presentation.

- [ ] **Step 3: Refresh Impeccable context**

Run: `node /Users/mason/.agents/skills/impeccable/scripts/load-context.mjs`

Expected: `hasProduct: true` and the root `PRODUCT.md` path.

### Task 3: Rebuild the global visual system and shared chrome

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Modify: `components/brand.tsx`

- [ ] **Step 1: Replace tokens and utilities in `globals.css`**

Define the botanical system with OKLCH tokens and hard-edged campaign utilities:

```css
@theme {
  --color-botanical: oklch(0.66 0.16 158);
  --color-botanical-bright: oklch(0.79 0.18 151);
  --color-forest: oklch(0.145 0.028 158);
  --color-mineral: oklch(0.955 0.012 138);
  --color-emergency: oklch(0.67 0.2 32);
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}

@utility evidence-rule { border-color: oklch(0.955 0.012 138 / 0.22); }
@utility campaign-grid {
  background-image: linear-gradient(to right, oklch(0.955 0.012 138 / .12) 1px, transparent 1px);
  background-size: 8.333% 100%;
}
```

Preserve chart tokens and reduced-motion behavior. Remove decorative rounded/glass defaults from shared surfaces.

- [ ] **Step 2: Load the forceful display face in `layout.tsx`**

Use `Archivo_Black` for display, keep Hanken Grotesk for body and Geist Mono for data. Preserve metadata and the fixed grain layer.

- [ ] **Step 3: Rebuild shared brand chrome**

Implement a sharp campaign masthead and footer using the existing `Logo`, `SiteHeader`, `SiteFooter`, and `StatusChip` public interfaces so all routes update without consumer changes.

- [ ] **Step 4: Run lint on the shared layer**

Run: `npm run lint -- app/layout.tsx components/brand.tsx`

Expected: PASS.

### Task 4: Replace cursor motion and rebuild the landing hero

**Files:**
- Modify: `components/fx.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Remove pointer-dependent shader behavior**

Delete the `u_mouse` uniform, pointer listener, and moving mouse state. Drive the field only with resolution and time, then add visibility pausing:

```tsx
const visible = useRef(true);
const io = new IntersectionObserver(([entry]) => {
  visible.current = entry.isIntersecting;
});
io.observe(canvas);

const loop = (t: number) => {
  if (visible.current) render(t * 0.001);
  raf = requestAnimationFrame(loop);
};
```

Keep the Canvas fallback and reduced-motion still frame.

- [ ] **Step 2: Remove the landing-page `Magnetic` import and wrapper**

The CTA must render as a normal stationary button. Hover changes only fill, label contrast, and the nested arrow translation.

- [ ] **Step 3: Build the image-led hero**

Use `next/image` with `school-campus.webp`. Compose the headline, image, evidence stamps, shader field, and CTA in one asymmetric desktop stage. Use the approved message “YOUR SCHOOL IS THE EVIDENCE.” and preserve navigation to `/analyze`.

- [ ] **Step 4: Run the UI contract**

Run: `node scripts/smoke-ui.mjs`

Expected: pointer and magnetic assertions pass; image and token assertions also pass after Tasks 2 and 3.

### Task 5: Rebuild the GSAP investigation and landing proof sections

**Files:**
- Modify: `components/CaseWalkthrough.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace five uniform cards with one pinned evidence stage**

Keep `STEPS` as content data, but render layered photo, metric, title, and evidence panels. Build one GSAP timeline:

```tsx
const timeline = gsap.timeline({
  scrollTrigger: {
    trigger: wrap.current,
    start: "top top",
    end: "+=4200",
    pin: true,
    scrub: 0.8,
    invalidateOnRefresh: true,
  },
});
```

Animate only transforms, clip paths, and opacity. Use `solar-array.webp` in the calculation/intervention phases and maintain the vertical reduced-motion fallback.

- [ ] **Step 2: Replace the uniform bento grid**

Create one dominant simulator evidence strip, one `student-action.webp` action panel, and compact confidence/peer/rebate modules with varied geometry.

- [ ] **Step 3: Recompose the intake form as an evidence sheet**

Preserve every existing field, state update, validation condition, and submit handler. Change only hierarchy, grouping, and styling.

- [ ] **Step 4: Verify the landing route manually**

Open `http://localhost:3000`, test both primary CTAs and form submission, then scroll through the pinned sequence.

Expected: CTA stays stationary, the investigation pins and unpins once, and the intake still routes to `/analyze`.

### Task 6: Reskin the analysis dashboard shell and modules

**Files:**
- Modify: `app/analyze/page.tsx`
- Modify: `components/ConfidenceMeter.tsx`
- Modify: `components/ImpactCard.tsx`
- Modify: `components/PeerGauge.tsx`
- Modify: `components/ProjectionChart.tsx`
- Modify: `components/RebateBadge.tsx`
- Modify: `components/StackedImpacts.tsx`
- Modify: `components/UsageEntry.tsx`
- Modify: `components/WhatIfSimulator.tsx`

- [ ] **Step 1: Recompose the dashboard shell**

Keep all current data derivation, event handlers, loading paths, and component props. Replace rounded panels with hard evidence sections, botanical headers, large totals, and clearer action hierarchy.

- [ ] **Step 2: Update meter and chart presentation**

Retain Recharts inputs and calculations. Apply the new tokens to axes, tooltip, categories, progress fills, and confidence states. Use Motion for transform/opacity entrances and value interpolation only.

- [ ] **Step 3: Update simulator, usage, rebates, and impact modules**

Preserve controls and public interfaces. Replace nested cards with structured rows, rules, and campaign labels; keep disabled, loading, empty, and active states visible.

- [ ] **Step 4: Verify analysis interactions**

Open `http://localhost:3000/analyze`, adjust each simulator control, toggle pitch mode, and exercise any available usage inputs.

Expected: displayed values and charts update exactly as before, with no console errors.

### Task 7: Document the implemented design system

**Files:**
- Create: `DESIGN.md`

- [ ] **Step 1: Record the implemented tokens and patterns**

Document the final palette, typography roles, spacing/grid rules, image treatment, panel geometry, form styling, chart colors, GSAP signature sequence, Motion timing, shader fallback, and reduced-motion behavior.

- [ ] **Step 2: Refresh context and confirm both files load**

Run: `node /Users/mason/.agents/skills/impeccable/scripts/load-context.mjs`

Expected: `hasProduct: true` and `hasDesign: true`.

### Task 8: Verification and visual refinement

**Files:**
- Modify: any UI file above only when verification exposes a defect.

- [ ] **Step 1: Run automated checks**

Run:

```bash
node scripts/smoke-ui.mjs
npm run lint
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 2: Inspect representative desktop viewports**

Inspect landing and analysis routes at 1440×900 and 1280×800. Also confirm a narrow viewport stacks without horizontal overflow, without investing in bespoke mobile choreography.

- [ ] **Step 3: Inspect reduced motion**

Emulate `prefers-reduced-motion: reduce` and verify all content is visible, the shader is static, and the GSAP section does not pin.

- [ ] **Step 4: Complete one critique-and-fix pass**

Compare the rendered result against the approved Direction B visual mock and the design spec. Fix missing photography, weak scale contrast, accidental rounded SaaS patterns, clipping, overflow, or overly busy motion.

- [ ] **Step 5: Re-run automated checks after final patches**

Run the three commands from Step 1 again.

Expected: all commands exit 0 after the critique pass.
