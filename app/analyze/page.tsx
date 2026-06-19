"use client";

import Link from "next/link";
import { type ReactElement, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import demoSchool from "@/data/school.json";
import { FLAGSHIP } from "@/lib/flagship";
import { buildEvidencePacket } from "@/lib/benchmarks";
import { estimateFromProfile } from "@/lib/estimate";
import { runLocalDetective } from "@/lib/localDetective";
import { rebatesForCategory } from "@/lib/rebates";
import { ConfidenceMeter } from "@/components/ConfidenceMeter";
import { ImpactCard } from "@/components/ImpactCard";
import { PeerGauge } from "@/components/PeerGauge";
import { WhatIfSimulator } from "@/components/WhatIfSimulator";
import { UsageEntry } from "@/components/UsageEntry";
import { withRealUsage } from "@/lib/usage";
import type { AnalyzeResponse, CategoryKey, SchoolData } from "@/lib/schema";

const school = demoSchool as unknown as SchoolData;

const CATEGORY_META: Record<CategoryKey, { label: string; icon: string; color: string }> = {
  energy: { label: "Energy", icon: "⚡", color: "#10b981" },
  water: { label: "Water", icon: "💧", color: "#0ea5e9" },
  waste: { label: "Waste", icon: "🗑️", color: "#f59e0b" },
  transportation: { label: "Transportation", icon: "🚌", color: "#8b5cf6" },
  food: { label: "Food", icon: "🍎", color: "#ef4444" },
};

const LABEL_TO_KEY: Record<string, CategoryKey> = Object.fromEntries(
  (Object.keys(CATEGORY_META) as CategoryKey[]).map((k) => [
    CATEGORY_META[k].label,
    k,
  ]),
);

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

type Source = "loading" | "ai" | "fallback";

export default function AnalyzePage() {
  const [mode, setMode] = useState<"Admin" | "Student">("Admin");
  const [dataMode, setDataMode] = useState<"full" | "estimate">("full");
  const [runId, setRunId] = useState(0);
  // Real numbers the user typed into the usage panel, keyed by category. Each one
  // overrides the estimate AND graduates that category to measured data.
  const [overrides, setOverrides] = useState<Partial<Record<CategoryKey, number>>>({});

  // Base school: the flagship demo by default, or a school the user submitted
  // from the landing intake (stashed in sessionStorage so it survives the
  // route change). SSR renders the flagship; the custom school swaps in client-side.
  const [baseSchool, setBaseSchool] = useState<SchoolData>(school);
  useEffect(() => {
    // Read the browser-only sessionStorage AFTER mount: reading it during
    // render would diverge from the SSR HTML (which has no sessionStorage) and
    // break hydration. This is the sanctioned "sync from an external store"
    // effect, so the set-state-in-effect rule does not apply.
    try {
      const raw = sessionStorage.getItem("greenspark.school");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setBaseSchool(JSON.parse(raw) as SchoolData);
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  const isFlagship = baseSchool.profile.name === school.profile.name;

  // The school under analysis: either the full entered data or a profile-only
  // benchmark autofill (which the confidence gate scores Low).
  const activeSchool = useMemo(
    () => (dataMode === "full" ? baseSchool : estimateFromProfile(baseSchool.profile)),
    [dataMode, baseSchool],
  );

  // The school actually analyzed: activeSchool with any real numbers the user
  // entered in the usage panel layered on top. Those categories graduate out of
  // `estimatedCategories`, so the confidence gate scores them as measured.
  const effectiveSchool = useMemo(
    () => withRealUsage(activeSchool, overrides),
    [activeSchool, overrides],
  );

  // Instant, client-side baseline so charts and cards render with zero wait;
  // the real Claude analysis then replaces it when /api/analyze responds.
  const localEvidence = useMemo(
    () => buildEvidencePacket(effectiveSchool),
    [effectiveSchool],
  );
  const localResponse = useMemo<AnalyzeResponse>(
    () => ({ evidence: localEvidence, detective: runLocalDetective(localEvidence) }),
    [localEvidence],
  );

  const [data, setData] = useState<AnalyzeResponse>(localResponse);
  const [source, setSource] = useState<Source>("loading");

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setSource("loading");
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(effectiveSchool),
        });
        if (!res.ok) throw new Error("analyze failed");
        const json = (await res.json()) as AnalyzeResponse;
        if (!cancelled) {
          setData(json);
          setSource("ai");
        }
      } catch {
        if (!cancelled) {
          setData(localResponse);
          setSource("fallback");
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [effectiveSchool, localResponse, runId]);

  const { evidence, detective } = data;

  const handleUsageChange = (key: CategoryKey, value: number | undefined) => {
    setOverrides((prev) => {
      const next = { ...prev };
      if (value == null) delete next[key];
      else next[key] = value;
      return next;
    });
  };

  const chartData = useMemo(
    () =>
      evidence.categories.map((c) => ({
        name: CATEGORY_META[c.category].label,
        co2t: Math.max(c.annualCo2eKg / 1000, 0),
        cost: c.annualCostUsd,
        category: c.category,
      })),
    [evidence],
  );

  const topImpactLabel = detective.top_impacts[0]?.category ?? "—";

  const studentPoints = useMemo(
    () =>
      detective.top_impacts.slice(0, 3).map((t) => ({
        category: t.category,
        headline: t.recommendations[0]?.action ?? t.quick_win,
        quickWin: t.quick_win,
        save: t.recommendations[0]?.estimated_annual_savings ?? "",
      })),
    [detective],
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-2xl">🌱</span>
          <span className="text-lg tracking-tight">Green Spark AI</span>
        </Link>
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-800">
          ← Back home
        </Link>
      </header>

      <main className="mx-auto w-full max-w-7xl px-6 pb-20">
        {/* Case file header */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                  Case file
                </p>
                <SourcePill source={source} />
              </div>
              <h1 className="mt-1 text-3xl font-bold tracking-tight">
                {evidence.profile.name}
              </h1>
              <p className="mt-1 text-slate-600">
                {evidence.profile.city}, {evidence.profile.state} ·{" "}
                {evidence.profile.students.toLocaleString()} students ·{" "}
                {evidence.profile.squareFootage.toLocaleString()} ft²
              </p>
              {isFlagship && (
                <p className="mt-2 max-w-2xl text-sm text-slate-500">
                  Opened by{" "}
                  <span className="font-medium text-slate-700">{FLAGSHIP.hero.name}</span>,{" "}
                  {FLAGSHIP.hero.role}, to {FLAGSHIP.hero.goal}.
                </p>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <button
                onClick={() => setRunId((n) => n + 1)}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
              >
                ↻ Re-run detective
              </button>
              <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1">
                <button
                  onClick={() => setMode("Admin")}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium ${mode === "Admin" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                >
                  Admin
                </button>
                <button
                  onClick={() => setMode("Student")}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium ${mode === "Student" ? "bg-white text-amber-700 shadow-sm" : "text-slate-500"}`}
                >
                  Student pitch
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Data-source toggle — demonstrates the confidence gate live */}
        <section className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <span className="text-sm font-medium text-slate-600">Data source</span>
          <div className="flex gap-1 rounded-full bg-slate-100 p-1">
            <button
              onClick={() => setDataMode("full")}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${dataMode === "full" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
            >
              Full data (entered)
            </button>
            <button
              onClick={() => setDataMode("estimate")}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${dataMode === "estimate" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
            >
              Profile-only (benchmark autofill)
            </button>
          </div>
          <span className="text-xs text-slate-400">
            {dataMode === "full"
              ? "Using the school's entered usage figures."
              : "Every category estimated from medians for a school this size — watch confidence drop to Low."}
          </span>
        </section>

        {/* Headline stats */}
        <section className="mt-6 grid gap-4 md:grid-cols-4">
          <StatCard
            label="Annual CO₂"
            value={`${Math.round(evidence.totals.annualCo2eKg / 1000).toLocaleString()} t`}
          />
          <StatCard
            label="Annual cost"
            value={formatCurrency(evidence.totals.annualCostUsd)}
          />
          <StatCard label="Data completeness" value={`${evidence.completenessScore}%`} />
          <StatCard label="Top impact" value={topImpactLabel} />
        </section>

        {mode === "Admin" ? (
          <>
            {/* Enter real numbers to graduate estimates → higher confidence */}
            <div className="mt-6">
              <UsageEntry
                school={activeSchool}
                overrides={overrides}
                onChange={handleUsageChange}
              />
            </div>

            {/* Verdict + confidence */}
            <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                  🔍 The detective&apos;s verdict
                </p>
                <p className="mt-3 text-lg leading-7 text-slate-800">
                  {detective.overall_verdict}
                </p>
              </div>
              <ConfidenceMeter
                level={detective.confidence_level}
                score={evidence.completenessScore}
                explanation={detective.confidence_explanation}
                missingCount={evidence.missingCategories.length}
              />
            </section>

            {/* Charts */}
            <section className="mt-6 grid gap-6 xl:grid-cols-2">
              <ChartCard title="Carbon footprint by category (t CO₂e / year)">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip formatter={(v) => `${Math.round(Number(v))} t`} />
                  <Bar dataKey="co2t" radius={[6, 6, 0, 0]}>
                    {chartData.map((e) => (
                      <Cell key={e.category} fill={CATEGORY_META[e.category].color} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartCard>
              <ChartCard title="Annual cost by category ($)">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Bar dataKey="cost" radius={[6, 6, 0, 0]}>
                    {chartData.map((e) => (
                      <Cell key={e.category} fill={CATEGORY_META[e.category].color} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartCard>
            </section>

            {/* Ranked impacts (the real detective output) */}
            <section className="mt-8">
              <div className="flex items-end justify-between">
                <h2 className="text-2xl font-semibold">Ranked impacts &amp; the fix</h2>
                <p className="text-sm text-slate-500">
                  Top {detective.top_impacts.length}, ranked by carbon, cost, and
                  how far above peers
                </p>
              </div>
              <div className="mt-4 grid gap-5 lg:grid-cols-3">
                {detective.top_impacts.map((impact) => {
                  const key = LABEL_TO_KEY[impact.category];
                  return (
                    <ImpactCard
                      key={impact.rank}
                      impact={impact}
                      rebates={key ? rebatesForCategory(key) : []}
                    />
                  );
                })}
              </div>
            </section>

            {/* Peer benchmarking */}
            <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                Peer benchmarking
              </p>
              <h2 className="mt-1 text-2xl font-semibold">
                How {evidence.profile.name} compares to similar-size schools
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Percentile across ~40 peer schools. The marker is the peer median.
                Higher means more intensive, so more to gain.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {evidence.categories
                  .filter((c) => c.peerPercentile != null && c.benchmark)
                  .map((c) => (
                    <PeerGauge
                      key={c.category}
                      label={`${CATEGORY_META[c.category].icon} ${CATEGORY_META[c.category].label} · ${c.benchmark!.label}`}
                      percentile={c.peerPercentile!}
                      value={c.intensityMetric!.value}
                      unit={c.intensityMetric!.unit}
                      median={c.benchmark!.median}
                    />
                  ))}
              </div>
            </section>

            {/* What-if simulator + 12-month projection */}
            <WhatIfSimulator school={effectiveSchool} />
          </>
        ) : (
          <StudentPitch
            schoolName={evidence.profile.name}
            heroName={FLAGSHIP.hero.name}
            verdict={detective.overall_verdict}
            points={studentPoints}
            co2t={Math.round(evidence.totals.annualCo2eKg / 1000)}
          />
        )}

        {/* Data disclosure */}
        <p className="mt-10 rounded-2xl bg-slate-100 p-4 text-xs leading-5 text-slate-500">
          {isFlagship
            ? FLAGSHIP.dataNote
            : "This school was analyzed from the profile you entered. Categories marked estimated are filled from published EPA, EIA, and DOE benchmark medians for a school this size and are weighted lower by the confidence gate. No private school data is required."}
        </p>
      </main>
    </div>
  );
}

function SourcePill({ source }: { source: Source }) {
  if (source === "loading")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
        Detective analyzing…
      </span>
    );
  if (source === "ai")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
        ✦ Analyzed live by Claude
      </span>
    );
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600"
      title="The Claude API key is not set or the call failed, so this is the deterministic offline estimate."
    >
      ◳ Offline estimate (AI key not set)
    </span>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: ReactElement }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
        {title}
      </p>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StudentPitch({
  schoolName,
  heroName,
  verdict,
  points,
  co2t,
}: {
  schoolName: string;
  heroName: string;
  verdict: string;
  points: { category: string; headline: string; quickWin: string; save: string }[];
  co2t: number;
}) {
  return (
    <section className="mt-6 space-y-6">
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
          Student pitch mode · for {heroName} to bring to the principal
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">
          {schoolName} can act on three things this year.
        </h2>
        <p className="mt-2 text-slate-700">{verdict}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {points.map((p, i) => (
          <div key={i} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-800">
              {i + 1}
            </span>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {p.category}
            </p>
            <p className="mt-1 font-semibold">{p.headline}</p>
            {p.save && (
              <p className="mt-2 text-sm text-emerald-700">Saves about {p.save}</p>
            )}
            <p className="mt-2 text-sm text-slate-600">
              <span className="font-medium">Start this week:</span> {p.quickWin}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-slate-500">
          One school. {co2t.toLocaleString()} tonnes of CO₂ a year. Three changes
          we can start now.
        </p>
        <p className="mt-1 text-lg font-semibold">
          That is {heroName}&apos;s case, in numbers the office can act on.
        </p>
      </div>
    </section>
  );
}
