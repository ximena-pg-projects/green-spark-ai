import Link from "next/link";
import demoSchool from "@/data/school.json";
import type { SchoolData } from "@/lib/schema";

// Placeholder demo school — swap data/school.json for the real US school once chosen.
const school = demoSchool as unknown as SchoolData;

export default function Home() {
  const p = school.profile;
  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-emerald-50 via-white to-white text-slate-900">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 font-semibold">
          <span className="text-2xl">🌱</span>
          <span className="text-lg tracking-tight">Green Spark AI</span>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
          USAII Hackathon 2026
        </span>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6">
        <section className="py-12 sm:py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-medium text-emerald-700">
            🔍 The Environmental AI Detective
          </span>
          <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Your school&apos;s{" "}
            <span className="text-emerald-600">hidden footprint</span>, solved
            like a case.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            Green Spark AI turns a school&apos;s everyday numbers into a ranked,
            cost-aware action plan — showing the biggest impacts, the dollars
            behind them, and the one move you can make this week.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/analyze"
              className="inline-flex h-12 items-center justify-center rounded-full bg-emerald-600 px-7 text-base font-medium text-white transition-colors hover:bg-emerald-700"
            >
              Investigate {p.name} →
            </Link>
            <span className="text-sm text-slate-500">
              Pre-loaded demo school · zero data entry needed
            </span>
          </div>
        </section>

        {/* Flagship school card — the local, specific anchor */}
        <section className="pb-12">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Demo case file
              </h2>
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                placeholder · swap in real school
              </span>
            </div>
            <p className="mt-2 text-xl font-semibold">{p.name}</p>
            <p className="text-slate-600">
              {p.city}, {p.state} · {p.schoolType} school
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ["Students", p.students.toLocaleString()],
                ["Staff", p.staff?.toLocaleString() ?? "—"],
                ["Floor area", `${p.squareFootage.toLocaleString()} ft²`],
                ["Grid region", p.gridRegion ?? "—"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">
                    {label}
                  </dt>
                  <dd className="mt-1 text-lg font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* input → AI → action */}
        <section className="grid gap-4 pb-16 sm:grid-cols-3">
          {[
            {
              step: "1 · Input",
              title: "School data",
              body: "Energy, water, waste, transport & food — as much or as little as you have.",
            },
            {
              step: "2 · AI",
              title: "The Detective reasons",
              body: "Computes CO₂ & cost, flags what's off vs. similar schools, ranks the top impacts.",
            },
            {
              step: "3 · Action",
              title: "A plan you can pitch",
              body: "ROI fixes with payback, a zero-budget quick win, and a student pitch view.",
            },
          ].map((c) => (
            <div
              key={c.step}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                {c.step}
              </p>
              <p className="mt-2 font-semibold">{c.title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{c.body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="mx-auto w-full max-w-5xl px-6 py-8 text-sm text-slate-400">
        Green Spark AI · USAII Global AI Hackathon 2026 · Challenge Brief 2 —
        Make Climate Action Local and Real
      </footer>
    </div>
  );
}
