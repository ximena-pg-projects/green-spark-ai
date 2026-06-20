# Green Spark AI Eco-Brutalist UI Overhaul

## Objective

Transform the landing page and analysis dashboard into a loud, image-led environmental campaign without changing backend behavior, calculations, API contracts, or unfinished product logic.

The experience should feel like environmental evidence turned into a public campaign: botanical, urgent, documentary, and technically advanced. Desktop and laptop viewports are the quality target. Small screens must remain functional, but bespoke mobile art direction is outside this pass.

## Audience and Scene

The primary audience is a student advocate or school stakeholder opening the product on a laptop or classroom display and needing the environmental case to feel immediate, credible, and difficult to ignore.

This scene requires high contrast, large readable evidence, confident green surfaces, and photography that connects abstract emissions to real schools and people.

## Visual Direction

### Core language

- Eco-brutalist campaign structure with oversized type, exposed grids, sharp dividers, evidence stamps, and intentionally asymmetric layouts.
- Documentary photography is structural, not decorative. Images occupy major portions of the hero and investigation sequence.
- Most rounded SaaS cards become flat evidence panels or hard-edged sectional compositions.
- Data remains precise and legible. Expressive composition must not obscure values, controls, or status.

### Color

- Primary: saturated botanical emerald.
- Foundation: near-black forest with a green tint, never pure black.
- Light surface and text: warm mineral white, never pure white.
- Supporting data colors: controlled amber, cyan, violet, and red, used by semantic category or state.
- Landing page uses a drenched color strategy. The dashboard uses a full-palette strategy over the dark forest foundation.

All new tokens use OKLCH.

### Typography

- Display: Archivo Black or a similarly forceful grotesk suitable for campaign posters and large evidence statements.
- Body: retain a highly readable humanist sans such as Hanken Grotesk.
- Data: retain a mono face only for measurements, case labels, and technical metadata.
- Headlines use compact line height and extreme scale contrast. Body copy remains sentence case and capped at readable line lengths.

## Landing Page

### Header

- Replace the generic sticky SaaS bar with a compact campaign masthead.
- Preserve direct access to the analysis flow.
- Use hard separators and a strong typographic mark rather than decorative glass treatment.

### Hero

- Lead with the campaign statement “YOUR SCHOOL IS THE EVIDENCE.”
- Integrate a large school architecture photograph as part of the composition.
- Keep the case metrics visible as stamped evidence rather than conventional stat cards.
- Keep “Open the case file” stationary. Remove the magnetic wrapper and cursor-following movement.
- Button hover may shift color, invert the nested arrow block, or move only the arrow by a few pixels. The button itself must not drift.
- Replace the cursor-reactive shader with an ambient botanical field that moves independently, pauses off-screen, and renders a still frame for reduced motion.

### Investigation sequence

- Rebuild the current horizontal GSAP walkthrough as the signature motion moment.
- Pin one large stage while documentary photo panels, evidence labels, calculation layers, and oversized numbers progress across it.
- Use GSAP ScrollTrigger for the pinned sequence and transform-only movement.
- Each phase must remain intelligible at rest and under reduced motion.
- Desktop receives the full pinned composition. Small screens use a simple vertical sequence.

### Capabilities and proof

- Replace the uniform bento-card field with varied editorial evidence strips.
- Combine one dominant simulator preview, one photographic intervention panel, and compact proof modules.
- Use data color only where it communicates a category or confidence state.

### Intake

- Present the form as an intake sheet attached to the campaign rather than a floating rounded card.
- Preserve every existing field, validation rule, and submit behavior.
- Improve hierarchy with numbered groups, hard rules, larger labels, and a strong submit block.

## Analysis Dashboard

### Shell

- Rework shared brand chrome into the same campaign system.
- Use the forest-black foundation, emerald section headers, hard panel geometry, and strong typographic hierarchy.
- Maintain current information architecture and routes.

### Data modules

- Reskin cards, charts, confidence indicators, peer gauges, scenario controls, rebates, and impact modules without changing their calculations or props.
- Replace decorative rounded containers with evidence panels and structured dividers.
- Preserve semantic category colors and improve label/value contrast.
- Use Framer Motion for coordinated module entrances, filter or scenario feedback, count changes, and chart reveals.
- Do not animate layout-driving properties when transform, opacity, clip paths, or chart interpolation can communicate the change.

### Functional boundaries

- No API route changes.
- No calculation, estimation, benchmark, simulation, or detective logic changes.
- No data schema changes.
- No new product features.

## Imagery

- Use three to five high-quality documentary photographs covering school architecture, solar infrastructure, and students taking action.
- Download and store optimized local copies under `public/images`.
- Deliver through `next/image` with appropriate sizes, quality, focal positioning, and descriptive alt text.
- Avoid generic nature imagery that does not connect to schools, energy, or action.
- Photo treatment may use grayscale, duotone, hard masks, or multiply blending when it supports the campaign composition, but faces and key subjects must remain legible.

## Motion System

- Signature moment: GSAP pinned investigation sequence.
- Entrance layer: coordinated Framer Motion reveals with purposeful stagger.
- Feedback layer: restrained control, chart, and scenario transitions.
- Ambient layer: one non-interactive hero shader with bounded rendering cost.
- Remove all cursor glow and magnetic CTA behavior.
- Use exponential ease-out curves. Avoid bounce and elastic motion.
- Respect `prefers-reduced-motion` across GSAP, Framer Motion, CSS, shader, and count animations.

## Components and Boundaries

- `app/globals.css`: palette, typography, geometry, texture, motion tokens, and reusable campaign utilities.
- `app/layout.tsx`: fonts, metadata, and global texture layer.
- `components/brand.tsx`: masthead, logo treatment, footer, and status labels.
- `components/fx.tsx`: ambient shader, progress indicator, scramble/readout effects; remove magnetic behavior from active use.
- `components/motion.tsx`: shared reveal and count primitives.
- `components/CaseWalkthrough.tsx`: GSAP investigation stage and its reduced-motion/mobile fallback.
- `app/page.tsx`: landing-page composition and intake presentation.
- `app/analyze/page.tsx` and existing dashboard components: visual reskin only, preserving data contracts.

## Error and Fallback Behavior

- WebGL failure falls back to a static or Canvas-based field.
- Images reserve layout space and use local optimized assets to avoid layout shifts.
- Reduced-motion mode shows all content in final readable positions.
- Existing form disabled, loading, error, and confidence states remain visible and understandable.
- Small screens stack content vertically and skip complex pinned choreography.

## Verification

- Verify landing page and `/analyze` at representative laptop and desktop sizes.
- Confirm the primary CTA stays fixed under pointer movement.
- Confirm no cursor-following glow remains.
- Confirm the GSAP sequence pins, progresses, unpins, and refreshes correctly.
- Confirm the ambient shader pauses off-screen and has graceful WebGL and reduced-motion fallbacks.
- Confirm all current interactions, form behavior, charts, simulation controls, and analysis navigation still work.
- Run lint and production build.
- Perform a final visual pass using the live local server at `http://localhost:3000`.

## Explicit Non-Goals

- Pixel-perfect mobile art direction.
- Backend refactoring.
- New analysis logic or data sources.
- New authentication, persistence, collaboration, or export features.
- Resolving unrelated unfinished code.
