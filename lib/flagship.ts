// lib/flagship.ts
// ─────────────────────────────────────────────────────────────────────────────
// The narrative anchor for the demo (Problem Understanding, the heaviest rubric
// row). The brief rewards local specificity: "a tool for a cafeteria manager"
// beats "a tool for schools." So the whole product is framed around ONE named
// school community, not "schools" in the abstract.
//
// This is metadata about the demo school, kept OUT of lib/schema.ts so the
// data contract stays clean. To swap in a different flagship school, edit
// data/school.json and the strings here together — nothing else depends on it.
// ─────────────────────────────────────────────────────────────────────────────

export const FLAGSHIP = {
  /** The school community using this view together. */
  hero: {
    name: "Our school community",
    role: "students, staff, and decision-makers",
    goal: "understand our footprint and choose the changes worth making next",
  },

  /** One-line statement of the local problem, in our shared voice. */
  problem:
    "We know our school can use energy, water, food, and materials more wisely. This view shows us where our impact comes from, what it costs, and which changes are worth making first.",

  /** Honest data label, surfaced in the UI so the public-data status is clear. */
  dataNote:
    "This view uses public data for Hanover High School. Building square footage and cafeteria food waste are not public, so those items are marked unknown or audit-needed. Transportation uses public diesel-fuel data, and our school has a composting program.",

  /** Short label for badges. */
  dataBadge: "Our public school data",
} as const;
