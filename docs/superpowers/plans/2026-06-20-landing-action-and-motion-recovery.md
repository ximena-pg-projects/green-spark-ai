# Landing Action and Motion Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove residual hard UI chrome, clarify the landing action workflow, eliminate repeated imagery, and make the pinned walkthrough reversible without a dark intermediate state.

**Architecture:** Keep the work within the existing landing-page component boundaries. `brand.tsx` owns the lockup, `page.tsx` owns the action workflow, `CaseWalkthrough.tsx` owns the pinned narrative and visual stages, and `globals.css` owns global viewport and palette behavior.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, GSAP ScrollTrigger, Motion, Phosphor icons.

---

### Task 1: Lock the requested UI contracts

**Files:**
- Modify: `scripts/smoke-ui.mjs`

- [ ] Add assertions that the landing page no longer mounts `ScrollProgress`, the viewport scrollbar is hidden without disabling scrolling, the logo lockup has no perimeter border, action cards use botanical hover color, each documentary image appears once, and walkthrough cards do not animate brightness filters.
- [ ] Run `node scripts/smoke-ui.mjs` and confirm it fails on the current implementation.

### Task 2: Remove hard scroll and brand chrome

**Files:**
- Modify: `components/brand.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`

- [ ] Replace the boxed logo with a borderless mark and wordmark.
- [ ] Remove the top progress component from the landing page.
- [ ] Hide only the viewport scrollbar using `scrollbar-width: none` and `::-webkit-scrollbar { display: none; }` while preserving page scrolling.
- [ ] Warm the mineral surface token so the action section is not visually pure white.

### Task 3: Rebuild the landing action workflow

**Files:**
- Modify: `app/page.tsx`

- [ ] Replace the bento grid with an editorial simulator module and supporting capability band.
- [ ] Make the simulator preview interactive with clear scenario labels and live cost/carbon output.
- [ ] Use botanical hover washes with stable forest text instead of near-black hover inversions.
- [ ] Preserve the student documentary image only in this section.

### Task 4: Make walkthrough imagery unique and motion reversible

**Files:**
- Modify: `components/CaseWalkthrough.tsx`

- [ ] Replace repeated photographs with four native data visuals and retain the solar photograph for the calculation stage.
- [ ] Run each transition as a simultaneous crossfade with no whole-card brightness filter.
- [ ] Add explicit `onLeaveBack` and `onEnterBack` state restoration for the first panel and refresh-safe initial state.
- [ ] Run `node scripts/smoke-ui.mjs` and confirm all UI contracts pass.

### Task 5: Verify production behavior

**Files:**
- Verify only

- [ ] Reproduce forward and reverse walkthrough scrolling at a 1440 by 900 viewport and confirm the first card remains visible.
- [ ] Run `npm run lint`.
- [ ] Run `npx tsc --noEmit`.
- [ ] Run `npm run build` with the development server stopped, then restart the local server.
- [ ] Run `git diff --check` and verify `/` returns HTTP 200.
