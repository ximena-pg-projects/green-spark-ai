// app/api/analyze/route.ts
// Serverless endpoint: SchoolData -> evidence packet (Layers 1-2) -> detective
// (Layer 3, Claude via CometAPI) -> AnalyzeResponse. COMET_API_KEY stays
// server-side and is never shipped to the browser.
//
// NOTE: this previously checked ANTHROPIC_API_KEY and called Claude directly
// via @anthropic-ai/sdk. The detective now calls Claude through CometAPI (an
// OpenAI-schema proxy) instead, so the required env var is COMET_API_KEY. See
// lib/detective.ts for why the request/response shapes changed along with it.
import { NextResponse } from "next/server";
import { buildEvidencePacket } from "@/lib/benchmarks";
import { runDetective } from "@/lib/detective";
import type { AnalyzeResponse, SchoolData } from "@/lib/schema";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(req: Request) {
  if (!process.env.COMET_API_KEY) {
    return NextResponse.json(
      {
        error:
          "COMET_API_KEY is not set. Add it to .env.local (e.g. COMET_API_KEY=sk-...) and restart the dev server.",
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
 
