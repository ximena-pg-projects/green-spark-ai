import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const page = await readFile("app/page.tsx", "utf8");
const fx = await readFile("components/fx.tsx", "utf8");
const css = await readFile("app/globals.css", "utf8");
const layout = await readFile("app/layout.tsx", "utf8");
const analyze = await readFile("app/analyze/page.tsx", "utf8");
const flagship = await readFile("lib/flagship.ts", "utf8");
const projection = await readFile("components/ProjectionChart.tsx", "utf8");
const usageEntry = await readFile("components/UsageEntry.tsx", "utf8");
const stacked = await readFile("components/StackedImpacts.tsx", "utf8");
const walkthrough = await readFile("components/CaseWalkthrough.tsx", "utf8");
const brand = await readFile("components/brand.tsx", "utf8");
const school = JSON.parse(await readFile("data/school.json", "utf8"));

assert(!page.includes("<Magnetic"), "primary CTA must not move magnetically");
assert(
  !fx.includes('addEventListener("pointermove"'),
  "shader must not follow the cursor",
);
assert(css.includes("--color-botanical"), "botanical design token is required");
assert(layout.includes("Afacad"), "Afacad must be the primary family");
assert(page.includes("Our school"), "landing page must use collective school voice");
assert(
  page.includes("Explore our school"),
  "primary CTA must use school-owned framing",
);
assert(
  !analyze.includes("Maya Reyes"),
  "dashboard must not use the fictional hero narrative",
);
assert(
  !flagship.includes("Principal Alvarez"),
  "flagship metadata must not use a fictional principal",
);
assert(css.includes("--space-section"), "shared spacing tokens are required");
assert(
  analyze.includes('initialDimension={{ width: 1, height: 1 }}'),
  "dashboard charts must provide an SSR-safe initial dimension",
);
assert(
  projection.includes('initialDimension={{ width: 1, height: 1 }}'),
  "projection chart must provide an SSR-safe initial dimension",
);
assert.equal(
  school.profile.name,
  "Hanover High School",
  "the flagship profile must use our school data",
);
assert(
  !page.includes("Mesa Verde"),
  "the landing page must not retain the former case-school label",
);
assert(
  usageEntry.includes("getUsageValue(school, k) != null"),
  "a category without its headline usage figure must not be labeled measured",
);
assert(
  !page.includes("lg:ml-[16.66%]"),
  "hero support copy must share the headline rail",
);
assert(
  css.includes("--color-ink: oklch(0.18"),
  "page ink must visibly read green-black",
);
assert(
  css.includes("border: 0;"),
  "evidence panels must use tonal separation",
);
assert(
  stacked.includes("ScrollTrigger.create"),
  "ranked impacts need a GSAP horizontal track",
);
assert(
  stacked.includes("x: () =>"),
  "ranked impacts must scrub horizontally",
);
assert(
  stacked.includes("const trackElement = track.current"),
  "horizontal cleanup must retain a non-null track element",
);
assert(
  !walkthrough.includes("const progress = useRef"),
  "walkthrough must not show progress UI",
);
assert(
  !page.includes("<ScrollProgress />") && !page.includes("ScrollProgress,"),
  "landing page must not mount a top progress rail",
);
assert(
  css.includes("scrollbar-width: none;") &&
    css.includes("html::-webkit-scrollbar") &&
    css.includes("display: none;"),
  "the viewport scrollbar must be hidden without disabling scroll",
);
assert(
  !brand.includes("border border-mineral bg-botanical") &&
    !brand.includes("border-y border-r border-mineral"),
  "the Green Spark AI lockup must not have a hard card border",
);
assert(
  !page.includes("hover:bg-forest hover:text-mineral") &&
    page.includes("hover:bg-botanical"),
  "action-system hover states must use botanical color instead of black",
);
for (const image of [
  "hanover-high-school.jpg",
  "school-profile.jpg",
  "solar-array.webp",
  "school-benchmark.jpg",
  "school-analysis.jpg",
  "school-action.jpg",
  "student-action.webp",
]) {
  const uses = `${page}\n${walkthrough}`.split(image).length - 1;
  assert.equal(uses, 1, `${image} must appear only once on the landing page`);
}
assert(
  !walkthrough.includes('filter: "brightness'),
  "walkthrough transitions must not blacken returning cards",
);
assert(
  walkthrough.includes("onLeaveBack: restoreFirstPanel"),
  "walkthrough must explicitly restore card one at the reverse boundary",
);
assert(
  walkthrough.includes('clipPath: "inset(0 0 0 100%)"') &&
    !walkthrough.includes("autoAlpha: 0,"),
  "walkthrough panels must use a reversible reveal without a dark opacity gap",
);
assert(
  page.includes('src="/images/hanover-high-school.jpg"'),
  "the landing hero must show the real Hanover High School building",
);
for (const image of [
  "school-profile.jpg",
  "solar-array.webp",
  "school-benchmark.jpg",
  "school-analysis.jpg",
  "school-action.jpg",
]) {
  assert(
    walkthrough.includes(`image: "/images/${image}"`),
    `${image} must provide a distinct walkthrough photograph`,
  );
}
assert(
  page.includes("group/preview") &&
    page.includes("group-hover/preview:bg-botanical"),
  "the complete what-if preview must receive a botanical hover state",
);

for (const file of [
  "public/images/school-campus.webp",
  "public/images/solar-array.webp",
  "public/images/student-action.webp",
  "public/images/hanover-high-school.jpg",
  "public/images/school-profile.jpg",
  "public/images/school-benchmark.jpg",
  "public/images/school-analysis.jpg",
  "public/images/school-action.jpg",
]) {
  await access(file);
}

console.log("UI contract smoke test passed");
