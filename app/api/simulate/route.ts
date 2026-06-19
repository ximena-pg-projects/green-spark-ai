// app/api/simulate/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// POST { school: SchoolData, interventionIds: string[] }
//   -> SimulationResult (baseline, projected, delta, per-category breakdown)
//
// Pure math, no LLM call — mirrors api/analyze's "school in, evidence out"
// shape but skips Layer 3 entirely, so this is cheap enough to call on every
// checkbox toggle in a what-if UI. Layer 2 (benchmarks/confidence) is also
// skipped on purpose: a what-if scenario isn't trying to say how *certain* we
// are about the school's data, just what changes if an intervention is applied.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import type { SchoolData } from "@/lib/schema";
import { simulate } from "@/lib/simulate";
import { INTERVENTIONS } from "@/lib/interventions";

interface SimulateRequestBody {
  school: SchoolData;
  interventionIds: string[];
}

function isValidBody(body: unknown): body is SimulateRequestBody {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.school === "object" &&
    b.school !== null &&
    typeof (b.school as SchoolData).profile === "object" &&
    Array.isArray(b.interventionIds) &&
    b.interventionIds.every((id) => typeof id === "string")
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  if (!isValidBody(body)) {
    return NextResponse.json(
      {
        error:
          'Expected { "school": SchoolData, "interventionIds": string[] }. ' +
          "See data/school.json for the SchoolData shape.",
      },
      { status: 400 },
    );
  }

  if (!body.school.profile.students || !body.school.profile.squareFootage) {
    return NextResponse.json(
      {
        error:
          "school.profile.students and school.profile.squareFootage are required " +
          "(several calc.ts intensity metrics divide by them).",
      },
      { status: 400 },
    );
  }

  try {
    const result = simulate(body.school, body.interventionIds);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("simulate() failed:", err);
    return NextResponse.json(
      { error: "Failed to compute simulation. Check school data shape." },
      { status: 500 },
    );
  }
}

/** GET returns the available intervention catalog, so a UI can build its
 *  checkbox/slider list without hardcoding ids client-side. */
export async function GET() {
  return NextResponse.json({ interventions: INTERVENTIONS }, { status: 200 });
}
