import Link from "next/link";
import demoSchool from "@/data/school.json";
import type { CategoryKey, SchoolData } from "@/lib/schema";

// Placeholder demo school — swap data/school.json for the real US school once chosen.
const school = demoSchool as unknown as SchoolData;

const CATEGORIES: { key: CategoryKey; label: string; icon: string }[] = [
  { key: "energy", label: "Energy", icon: "⚡" },
  { key: "water", label: "Water", icon: "💧" },
  { key: "waste", label: "Waste", icon: "🗑️" },
  { key: "transportation", label: "Transportation", icon: "🚌" },
  { key: "food", label: "Food", icon: "🍎" },
];

function fieldsFilled(obj: Record<string, unknown> | undefined): number {
  if (!obj) return 0;
  return Object.values(obj).filter((v) => v !== undefined && v !== null).length;
}

export default function AnalyzePage() {
  const p = school.profile;
  // Placeholder completeness: share of the 5 categories that have any data.
  const present = CATEGORIES.filter(
    (c) => fieldsFilled(school[c.key] as Record<string, unknown>) > 0,
  ).length;
  const completeness = Math.round((present / CATEGORIES.length) * 100);

  return (
    <div className="flex flex-1 flex-col bg-slate-50 text-slate-900">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-2xl">🌱</span>
          <span className="text-lg tracking-tight">Green Spark AI</span>
        </Link>
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-800">
          ← Back
        </Link>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 pb-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          Case file
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">{p.name}</h1>
        <p className="text-slate-600">
          {p.city}, {p.state} · {p.students.toLocaleString()} students ·{" "}
          {p.squareFootage.toLocaleString()} ft²
        </p>

        {/* Completeness meter (placeholder — real impact-weighted score lands Day 2) */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Data completeness</span>
            <span className="text-slate-500">{completeness}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${completeness}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Drives the Detective&apos;s confidence level. This flagship case is
            fully loaded, so the analysis runs at high confidence.
          </p>
        </div>

        {/* Pre-loaded category data */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {CATEGORIES.map((c) => {
            const data = school[c.key] as Record<string, unknown> | undefined;
            return (
              <div
                key={c.key}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <p className="font-semibold">
                  {c.icon} {c.label}
                </p>
                <dl className="mt-3 space-y-1 text-sm">
                  {data ? (
                    Object.entries(data).map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4">
                        <dt className="text-slate-500">{k}</dt>
                        <dd className="font-medium text-slate-800">
                          {String(v)}
                        </dd>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400">No data entered.</p>
                  )}
                </dl>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex items-center gap-4">
          <button
            disabled
            className="inline-flex h-12 cursor-not-allowed items-center justify-center rounded-full bg-emerald-600/50 px-7 text-base font-medium text-white"
          >
            🔍 Run the Detective
          </button>
          <span className="text-sm text-slate-500">
            Wiring to <code className="text-slate-700">/api/analyze</code> +
            Claude lands Day 2.
          </span>
        </div>
      </main>
    </div>
  );
}
