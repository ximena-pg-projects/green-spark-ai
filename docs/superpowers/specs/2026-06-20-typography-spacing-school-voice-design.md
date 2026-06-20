# Green Spark AI Typography, Spacing, and School Voice Refinement

## Objective

Refine the eco-brutalist rebuild into a more aesthetic, minimalist interface by replacing the current heavy display face, correcting inconsistent spacing across both routes, and changing the narrative from an outside case study to a collective view of our school.

This pass remains UI-only. Existing calculations, API behavior, data schemas, analysis logic, and teammate backend changes remain untouched.

## Typography

### Font system

- Afacad becomes the primary family for display, headings, body text, controls, and navigation.
- Geist Mono remains limited to data labels, units, compact metadata, and technical status.
- Remove Archivo Black and Hanken Grotesk from the loading and token system.
- Load only Afacad weights 400, 500, 600, and 700.

### Voice and hierarchy

- Major headlines use sentence case rather than forced uppercase.
- Display weight defaults to 600 or 700, not a single ultra-heavy face.
- Landing-page headlines remain large and fluid, but use calmer line height and less aggressive tracking.
- Dashboard headings use a predictable fixed scale.
- Body copy stays at or above 1rem with comfortable line height and a maximum measure of 65 to 70 characters.
- Mono labels remain uppercase with controlled tracking.

## Spacing System

Use a consistent four-point scale with the following working rhythm:

- Tight: 8px and 12px for related label/value or icon/text pairs.
- Standard: 16px and 24px for component interiors and control groups.
- Section: 32px and 48px for dashboard module separation.
- Macro: 64px and 96px for landing-page composition and section transitions.

### Landing page

- Reduce crowding between hero metadata, headline, description, and CTA.
- Keep the hero visually strong without forcing important content against the viewport edge.
- Give narrative and proof sections more vertical breathing room.
- Align section headings, images, dividers, and controls to the twelve-column grid.
- Remove accidental near-equal gaps that flatten hierarchy.

### Analysis dashboard

- Use tighter, predictable spacing inside data modules.
- Use larger, consistent gaps between module groups.
- Align the case header, controls, data source row, metric band, usage entry, charts, impacts, peers, and simulator to the same outer grid.
- Correct awkward empty zones and overly compressed text blocks.
- Preserve data density without returning to nested card layouts.

## School Narrative

### Perspective

The product speaks from inside the school community using “we,” “our school,” and “our footprint.” It no longer treats the school as an outside case subject.

### Landing page

- Replace “Your school is the evidence” with “Our school, clearly seen.”
- Supporting copy frames the tool as a shared view of our school’s footprint, costs, and strongest next actions.
- Rename the primary action from “Open the case file” to “Explore our school.”
- Preserve the stationary button behavior.
- Investigation language becomes “how we understand our school” rather than how a case is solved.

### Analysis page

- Present the dashboard as “Our school’s environmental view.”
- Remove the fictional Maya Reyes and Principal Alvarez narrative from visible UI.
- Reframe student pitch language as a shared case the school community can bring to decision-makers.
- Keep the named school and location visible where supplied by the real data profile.

### Data honesty

- Do not imply that estimated consumption is measured.
- Preserve labels for entered, estimated, offline, and live AI data.
- Update the representative-data disclosure to first-person school language while retaining its meaning.

## Component Scope

- `app/layout.tsx`: Afacad loading and metadata wording.
- `app/globals.css`: typography tokens, spacing tokens, text wrapping, and shared section rhythm.
- `components/brand.tsx`: refined wordmark, header/footer type, and spacing.
- `app/page.tsx`: hero copy, CTA, landing section spacing, and intake rhythm.
- `components/CaseWalkthrough.tsx`: collective school language and balanced stage spacing.
- `app/analyze/page.tsx`: school-owned framing, header hierarchy, dashboard group rhythm, and student view copy.
- Existing dashboard modules: targeted padding, heading, label, and internal-gap corrections only.
- `lib/flagship.ts`: remove fictional hero framing and replace it with school-owned narrative metadata without changing calculation data.
- `PRODUCT.md` and `DESIGN.md`: record the refined voice, type system, and spacing rules.

## Verification

- Inspect landing and analysis routes at 1280×800 and 1440×900.
- Compare repeated padding and gap values against the defined spacing scale.
- Confirm no visible fictional Maya/Principal framing remains.
- Confirm “our school” language is consistent without becoming repetitive.
- Confirm Afacad loads without layout overflow or unstable wrapping.
- Confirm the primary CTA remains stationary.
- Run UI smoke test, lint, TypeScript, and production build.
- Treat backend failures separately from UI failures if teammate integration is incomplete.

## Non-Goals

- New backend features or API behavior.
- Replacing the school data model.
- Claiming estimated data is measured.
- Bespoke mobile art direction.
- Returning to a soft sustainability-template aesthetic.
