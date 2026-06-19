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
    name: "Maya Reyes",
    role: "Green Team lead",
    grade: 11,
    /** The decision she is trying to win. */
    goal: "make the case to Principal Alvarez for three changes the school can afford this year",
  },

  /** One-line statement of the local problem, in the hero's voice. */
  problem:
    "Maya knows Mesa Verde wastes energy, water, and food, but she has never seen the building's numbers in one place, and she cannot walk into the principal's office with a vague feeling. She needs to know which few things matter most and what fixing them costs.",

  /**
   * Honest data label, surfaced in the UI so synthetic figures are never shown
   * as measured truth. This is also the Devpost "Data Disclosure" answer.
   */
  dataNote:
    "Representative profile of a mid-size Austin high school. The profile (size, enrollment, location, grid region) is realistic; consumption figures are synthetic estimates drawn from published EPA, EIA, and DOE benchmark ranges and are clearly labeled as estimates. No private school data is required.",

  /** Short label for badges. */
  dataBadge: "Representative demo data",
} as const;
