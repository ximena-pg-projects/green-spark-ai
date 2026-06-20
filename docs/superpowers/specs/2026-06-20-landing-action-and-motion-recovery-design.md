# Landing Action and Motion Recovery Design

## Goal

Make the landing page easier to read and more visually cohesive while removing the remaining hard-edged chrome and fixing the reverse-scroll blackout in the pinned walkthrough.

## Header and scroll chrome

The Green Spark AI lockup becomes a borderless wordmark with a small botanical symbol, not a boxed card. The top page-progress rail is removed. The browser viewport scrollbar is visually hidden while wheel, trackpad, keyboard, anchor, and programmatic scrolling remain functional.

## Action section

“Turn what we see into what we do” becomes one editorial workflow rather than a bento-card grid. The section uses a warmer, green-tinted mineral background. Its main simulator preview explains a direct sequence: choose a move, see annual cost and carbon update, then open the full analysis. Supporting capabilities sit in a quiet four-column band with soft botanical hover washes. Hover never changes a light card to near-black.

## Imagery

Each documentary photograph appears once on the landing page: the campus in the hero, solar infrastructure in the calculation stage, and student collaboration in the action section. The other walkthrough stages use purpose-built data graphics, avoiding repeated photographs without adding decorative stock imagery.

## Walkthrough motion

Every panel transition uses a simultaneous, symmetric crossfade and transform. Whole-card brightness filters are removed. At both scroll boundaries GSAP explicitly restores the correct visible panel, so card one is fully legible when reversing into the first stage. Reduced-motion and sub-desktop layouts remain static and readable.

## Verification

Static UI contracts cover progress removal, scrollbar hiding, borderless branding, unique imagery, green hover behavior, and the absence of whole-card brightness filters. Runtime QA checks forward and reverse scroll states, followed by lint, TypeScript, and production build verification.
