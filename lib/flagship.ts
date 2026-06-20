// lib/flagship.ts
// ─────────────────────────────────────────────────────────────────────────────
// The narrative anchor for the demo (Problem Understanding, the heaviest rubric
// row). The brief rewards local specificity: "a tool for a cafeteria manager"
// beats "a tool for schools." So the whole product is framed around ONE named
// school and ONE named hero user, not "schools" in the abstract.
//
// This is metadata about the demo school, kept OUT of lib/schema.ts so the
// data contract stays clean. To swap in a different flagship school, edit
// data/school.json and the strings here together — nothing else depends on it.
// ─────────────────────────────────────────────────────────────────────────────

export const FLAGSHIP = {
  /** The hero user: who is actually sitting in front of this tool. */
  hero: {
    name: "Avery Chen",
    role: "student sustainability lead",
    grade: 11,
    /** The decision she is trying to win. */
    goal: "make the case to school leadership for three changes the school can afford this year",
  },

  /** One-line statement of the local problem, in the hero's voice. */
  problem:
    "Avery wants a clear picture of Hanover High School's energy, water, transportation, and waste footprint so she can ask for the next step with confidence.",

  /**
   * Honest data label, surfaced in the UI so the public-data status is clear.
   */
  dataNote:
    "Public demo data for Hanover High School. Building square footage and cafeteria food waste are not public, so those items are marked unknown or audit-needed. Transportation uses public diesel-fuel data, and the school is noted as having a composting program.",

  /** Short label for badges. */
  dataBadge: "Public demo data",
} as const;
