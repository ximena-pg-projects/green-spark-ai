// app/api/analyze/route.ts
// Serverless endpoint: SchoolData -> evidence packet (Layers 1-2) -> Claude
// detective (Layer 3) -> AnalyzeResponse. The ANTHROPIC_API_KEY stays server-side
// and is never shipped to the browser.

import { NextResponse } from "next/server";
import { buildEvidencePacket } from "@/lib/benchmarks";
import { runDetective } from "@/lib/detective";
import type { AnalyzeResponse, SchoolData } from "@/lib/schema";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        error:
          "ANTHROPIC_API_KEY is not set. Copy .env.local.example to .env.local and add your key.",
      },
      { status: 500 },
    );
  }

  let school: SchoolData;
  try {
    school = (await req.json()) as SchoolData;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!school?.profile?.name) {
    return NextResponse.json(
      { error: "Missing school.profile." },
      { status: 400 },
    );
  }

  try {
    const evidence = buildEvidencePacket(school);
    const detective = await runDetective(evidence);
    const body: AnalyzeResponse = { evidence, detective };
    return NextResponse.json(body);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
