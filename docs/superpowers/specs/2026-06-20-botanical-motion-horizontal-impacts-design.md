# Botanical Motion and Horizontal Impacts Design

## Goal

Refine the current desktop experience so it reads as botanical rather than pure black, replaces hard card outlines with tonal depth, fixes the landing copy alignment, and turns the ranked opportunities into an immersive horizontal sequence.

## Color and surfaces

The current green-tinted black is technically not pure black, but its low lightness makes it appear black on ordinary laptop displays. Lift the ink and panel tokens into a visible chlorophyll range while retaining high contrast. The page foundation remains the darkest surface, with panels separated through perceptible changes in green lightness, restrained inset highlights, and soft ambient shadows.

Cards must not rely on full hard outlines. Evidence panels, ranked opportunities, charts, and narrative frames use tonal separation. Hairlines remain only where they communicate structure, including controls, tables, fields, chart grids, and major section boundaries.

## Landing alignment

Keep the two-line headline exactly as written. Remove the extra desktop left margin from “A clear view of our footprint…” so it aligns to the headline’s left rail. The CTA remains stationary and keeps its current strong contrast.

## Horizontal opportunities

On laptop and desktop widths, “Our highest-impact opportunities” becomes a GSAP-pinned horizontal track. Vertical scrolling scrubs the cards from right to left. Cards remain wide enough to preserve readable recommendation rows and move as one continuous sequence. No progress bar, dots, page counter, or visible tracker is added.

Reduced-motion and smaller-screen users receive a native horizontal overflow row with scroll snapping and no pinning.

## Motion

The landing hero gains restrained scroll depth: the documentary image scales and drifts while the copy moves at a slower opposing rate. The existing five-step walkthrough keeps its pinned narrative but uses stronger depth, scale, and media transitions. Its existing visible progress bar is removed.

Motion uses transforms, opacity, and bounded image filters. It never follows the cursor, never moves the primary CTA, and fully disables pinned choreography under `prefers-reduced-motion`.

## Acceptance criteria

- The base background visibly reads as deep green-black rather than literal black.
- The landing supporting sentence has no extra desktop indentation.
- Ranked impact cards move horizontally on desktop and do not stack vertically.
- No visible progress indicator is introduced, and the walkthrough progress bar is removed.
- Evidence cards are separated primarily by tone and depth, not hard perimeter borders.
- Existing school data, collective voice, controls, and reduced-motion behavior remain intact.

