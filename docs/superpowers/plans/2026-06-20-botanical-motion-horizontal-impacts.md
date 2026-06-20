# Botanical Motion and Horizontal Impacts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the interface visibly botanical, soften card geometry, fix landing copy alignment, and present ranked opportunities as a progress-free GSAP horizontal sequence.

**Architecture:** Extend the existing token system in `app/globals.css`, keep the current Afacad identity, and concentrate scroll orchestration in the two existing client motion components. Static source assertions in `scripts/smoke-ui.mjs` protect the requested visual contract, while live desktop screenshots verify the spatial and motion result.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, GSAP 3 with ScrollTrigger, Motion, Recharts.

---

### Task 1: Lock the visual contract

**Files:**
- Modify: `scripts/smoke-ui.mjs`

- [ ] **Step 1: Add failing source assertions**

```js
const stacked = await readFile("components/StackedImpacts.tsx", "utf8");
const walkthrough = await readFile("components/CaseWalkthrough.tsx", "utf8");

assert(!page.includes("lg:ml-[16.66%]"), "hero support copy must share the headline rail");
assert(css.includes("--color-ink: oklch(0.18"), "page ink must visibly read green-black");
assert(css.includes("border: 0;"), "evidence panels must use tonal separation");
assert(stacked.includes("ScrollTrigger.create"), "ranked impacts need a GSAP horizontal track");
assert(stacked.includes("x: () =>"), "ranked impacts must scrub horizontally");
assert(!walkthrough.includes("const progress = useRef"), "walkthrough must not show progress UI");
```

- [ ] **Step 2: Run the contract test and verify it fails**

Run: `node scripts/smoke-ui.mjs`

Expected: FAIL on the first missing refinement assertion.

### Task 2: Lift the palette and soften panels

**Files:**
- Modify: `app/globals.css`
- Modify: `DESIGN.md`

- [ ] **Step 1: Lift the botanical neutral tokens**

```css
--color-ink: oklch(0.18 0.036 158);
--color-ink-2: oklch(0.205 0.04 158);
--color-panel: oklch(0.23 0.042 158);
--color-panel-2: oklch(0.265 0.046 158);
```

- [ ] **Step 2: Replace the evidence-panel outline with tonal depth**

```css
@utility evidence-panel {
  background: var(--color-panel);
  border: 0;
  border-radius: 1.25rem;
  box-shadow:
    inset 0 1px 0 oklch(0.955 0.012 138 / 0.05),
    0 28px 80px oklch(0.09 0.03 158 / 0.18);
}
```

- [ ] **Step 3: Update the design documentation**

Document that large content surfaces use tonal depth and soft geometry, while controls and data structures retain functional hairlines.

- [ ] **Step 4: Run the smoke test**

Run: `node scripts/smoke-ui.mjs`

Expected: palette and border assertions pass; horizontal-motion assertions still fail.

### Task 3: Fix hero alignment and add scroll depth

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Remove the support-copy indent**

Replace the support paragraph class so it contains no `lg:ml-[16.66%]` and stays at `max-w-[55ch]`.

- [ ] **Step 2: Add scoped hero ScrollTrigger refs**

```tsx
const hero = useRef<HTMLElement>(null);
const heroCopy = useRef<HTMLDivElement>(null);
const heroMedia = useRef<HTMLDivElement>(null);

useEffect(() => {
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
    gsap.timeline({
      scrollTrigger: { trigger: hero.current, start: "top top", end: "bottom top", scrub: 0.9 },
    })
      .to(heroCopy.current, { yPercent: -8, autoAlpha: 0.45, ease: "none" }, 0)
      .to(heroMedia.current, { yPercent: 6, scale: 1.08, ease: "none" }, 0);
  });
  return () => mm.revert();
}, []);
```

- [ ] **Step 3: Attach refs without changing CTA behavior**

Attach `hero`, `heroCopy`, and `heroMedia` to the existing hero nodes. Do not add pointer listeners or magnetic motion.

- [ ] **Step 4: Run TypeScript and the smoke test**

Run: `npx tsc --noEmit && node scripts/smoke-ui.mjs`

Expected: TypeScript passes; only horizontal-motion assertions may remain failing.

### Task 4: Deepen the walkthrough without progress UI

**Files:**
- Modify: `components/CaseWalkthrough.tsx`

- [ ] **Step 1: Remove progress state and markup**

Delete the progress ref, progress initialization, timeline progress tween, and visible bar.

- [ ] **Step 2: Add depth-aware panel transitions**

```tsx
gsap.set(items, { autoAlpha: 0, xPercent: 14, scale: 0.9, rotateY: -5 });
timeline
  .to(previous, { autoAlpha: 0.18, xPercent: -10, scale: 1.04, rotateY: 4, duration: 0.5 })
  .fromTo(current, { autoAlpha: 0, xPercent: 14, scale: 0.9, rotateY: -5 }, {
    autoAlpha: 1, xPercent: 0, scale: 1, rotateY: 0, duration: 0.65, ease: "power4.out",
  }, "<0.12");
```

- [ ] **Step 3: Animate each incoming documentary image**

Target each panel’s `[data-case-media]` element and scrub it from `scale: 1.15` to `scale: 1` during the panel entrance.

- [ ] **Step 4: Remove the narrative frame outline**

Use tonal background, rounded geometry, and a bounded shadow instead of `border border-line-strong`.

- [ ] **Step 5: Run lint and TypeScript**

Run: `npm run lint && npx tsc --noEmit`

Expected: both commands exit 0.

### Task 5: Replace vertical impacts with a GSAP horizontal track

**Files:**
- Modify: `components/StackedImpacts.tsx`
- Modify: `components/ImpactCard.tsx`
- Modify: `app/analyze/page.tsx`

- [ ] **Step 1: Replace Motion stacking with a GSAP track**

```tsx
const viewport = useRef<HTMLDivElement>(null);
const track = useRef<HTMLDivElement>(null);

ScrollTrigger.create({
  trigger: viewport.current,
  start: "top top+=88",
  end: () => `+=${Math.max(1, track.current!.scrollWidth - viewport.current!.clientWidth)}`,
  pin: true,
  scrub: 0.9,
  animation: gsap.to(track.current, {
    x: () => -(track.current!.scrollWidth - viewport.current!.clientWidth),
    ease: "none",
  }),
  invalidateOnRefresh: true,
});
```

- [ ] **Step 2: Provide the reduced-motion and smaller-screen fallback**

Render the track as `overflow-x-auto snap-x snap-mandatory` below 1024px or under reduced motion. Do not render progress UI.

- [ ] **Step 3: Set wide, readable opportunity widths**

Each child uses `w-[min(78vw,860px)] shrink-0 snap-start`, and the track uses generous horizontal gaps instead of a narrow centered column.

- [ ] **Step 4: Remove the impact card perimeter border**

Keep recommendation dividers and semantic quick-win tint, but rely on the shared tonal panel surface for the card boundary.

- [ ] **Step 5: Keep the section heading outside the pinned card surface**

Retain the current heading and explanatory label, but remove any tracker language or numbered progress UI.

- [ ] **Step 6: Run the contract test**

Run: `node scripts/smoke-ui.mjs`

Expected: PASS.

### Task 6: Verify production and visual quality

**Files:**
- Modify only if verification identifies a defect.

- [ ] **Step 1: Run static verification**

Run: `node scripts/smoke-ui.mjs && npm run lint && npx tsc --noEmit && npm run build && git diff --check`

Expected: all commands exit 0 with no warnings or conflict markers.

- [ ] **Step 2: Capture laptop screenshots**

Capture `/` and `/analyze` at 1440×900 from `http://localhost:3000`.

Expected: the background reads green-black, landing copy is flush-left, and the ranked opportunities begin as a horizontal rail.

- [ ] **Step 3: Verify live routes**

Run: `curl` against `/` and `/analyze`.

Expected: both routes return HTTP 200.

