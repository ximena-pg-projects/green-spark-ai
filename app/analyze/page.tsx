"use client";

import Link from "next/link";
import { type ReactElement, type ReactNode, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
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
import {
  ArrowLeft,
  ArrowsClockwise,
  Sparkle,
  CircleNotch,
  PlugsConnected,
} from "@phosphor-icons/react";
import demoSchool from "@/data/school.json";
import { FLAGSHIP } from "@/lib/flagship";
import { buildEvidencePacket } from "@/lib/benchmarks";
import { estimateFromProfile } from "@/lib/estimate";
import { runLocalDetective } from "@/lib/localDetective";
import { rebatesForCategory } from "@/lib/rebates";
import { CATEGORY, CATEGORY_KEYS, keyFromLabel } from "@/lib/theme";
import { CATEGORY_ICON } from "@/lib/icons";
import { SiteHeader, SiteFooter } from "@/components/brand";
import { Reveal } from "@/components/motion";
import { ScrollProgress, ScrubCount } from "@/components/fx";
import { ConfidenceMeter } from "@/components/ConfidenceMeter";
import { ImpactCard } from "@/components/ImpactCard";
import { StackedImpacts } from "@/components/StackedImpacts";
import { PeerGauge } from "@/components/PeerGauge";
import { WhatIfSimulator } from "@/components/WhatIfSimulator";
import { UsageEntry } from "@/components/UsageEntry";
import { getUsageValue, withRealUsage } from "@/lib/usage";
import type { AnalyzeResponse, CategoryKey, SchoolData } from "@/lib/schema";

const school = demoSchool as unknown as SchoolData;

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
  const [overrides, setOverrides] = useState<Partial<Record<CategoryKey, number>>>({});

  const [baseSchool, setBaseSchool] = useState<SchoolData>(school);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("greenspark.school");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setBaseSchool(JSON.parse(raw) as SchoolData);
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  const isFlagship = baseSchool.profile.name === school.profile.name;

  const activeSchool = useMemo(
    () => (dataMode === "full" ? baseSchool : estimateFromProfile(baseSchool.profile)),
    [dataMode, baseSchool],
  );

  const effectiveSchool = useMemo(
    () => withRealUsage(activeSchool, overrides),
    [activeSchool, overrides],
  );

  const localEvidence = useMemo(
    () => buildEvidencePacket(effectiveSchool),
    [effectiveSchool],
  );
  const localResponse = useMemo<AnalyzeResponse>(
    () => ({ evidence: localEvidence, detective: runLocalDetective(localEvidence) }),
    [localEvidence],
  );

  // The live Claude call is gated behind a public flag so the dashboard runs on
  // the deterministic local detective until the serverless backend (api/analyze
  // + its provider SDK + key) is wired up. Flip NEXT_PUBLIC_ENABLE_AI=1 in
  // .env.local to light up the live path once that lands. Until then the UI
  // renders fully from runLocalDetective and shows the "Offline estimate" pill.
  const AI_ENABLED = process.env.NEXT_PUBLIC_ENABLE_AI === "1";
  const [data, setData] = useState<AnalyzeResponse>(localResponse);
  const [source, setSource] = useState<Source>(AI_ENABLED ? "loading" : "fallback");

  useEffect(() => {
    if (!AI_ENABLED) {
      // Keep the dashboard in sync with the locally-computed analysis as the
      // user toggles data source, enters real usage, or re-runs.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(localResponse);
      setSource("fallback");
      return;
    }
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
  }, [AI_ENABLED, effectiveSchool, localResponse, runId]);

  const { evidence, detective } = data;
  const needsBuildingSize =
    evidence.profile.squareFootage == null || evidence.profile.squareFootage <= 0;
  const estimatedCategories = new Set(effectiveSchool.estimatedCategories ?? []);
  const measuredCategoryCount = CATEGORY_KEYS.filter(
    (key) => getUsageValue(effectiveSchool, key) != null && !estimatedCategories.has(key),
  ).length;
  const dataCompletenessLabel = `${measuredCategoryCount} of ${CATEGORY_KEYS.length} measured`;

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
        name: CATEGORY[c.category].label,
        co2t: Math.max(c.annualCo2eKg / 1000, 0),
        cost: c.annualCostUsd,
        category: c.category,
      })),
    [evidence],
  );

  const topImpactLabel = detective.top_impacts[0]?.category ?? "—";
  const topImpactKey = keyFromLabel(topImpactLabel);
  const TopIcon = topImpactKey ? CATEGORY_ICON[topImpactKey] : null;

  const completenessTone =
    evidence.completenessScore >= 75
      ? "text-signal"
      : evidence.completenessScore >= 45
        ? "text-amber"
        : "text-rose";

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
    <div className="flex min-h-dvh flex-col">
      <ScrollProgress />
      <SiteHeader
        right={
          <Link
            href="/"
            className="inline-flex items-center gap-2 border-b border-mineral pb-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-mineral transition-colors duration-300 hover:text-botanical-bright"
          >
            <ArrowLeft weight="bold" className="h-3.5 w-3.5" />
            New case
          </Link>
        }
      />

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-5 pb-24 pt-8 sm:px-8 lg:px-12">
        {/* ── School view header ───────────────────────────────────────── */}
        <section className="evidence-panel relative overflow-hidden p-6 sm:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="kicker text-signal">Our school · environmental view</span>
                <SourcePill source={source} />
              </div>
              <h1 className="mt-6 font-display text-[clamp(3.25rem,5vw,5.8rem)] font-semibold leading-[0.9] tracking-[-0.055em]">
                {evidence.profile.name}
              </h1>
              <p className="mt-4 font-mono text-[12px] tabular-nums text-muted">
                {evidence.profile.city}, {evidence.profile.state}
                <span className="mx-2 text-faint">/</span>
                {evidence.profile.students.toLocaleString()} students
                <span className="mx-2 text-faint">/</span>
                {needsBuildingSize
                  ? "Building size not public"
                  : `${evidence.profile.squareFootage!.toLocaleString()} ft²`}
              </p>
              {isFlagship && <p className="mt-6 max-w-[68ch] text-base leading-[1.6] text-muted">{FLAGSHIP.problem}</p>}
            </div>
            <div className="flex shrink-0 flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <button
                onClick={() => setRunId((n) => n + 1)}
                className="group inline-flex h-11 items-center justify-center gap-2 border border-line-strong px-4 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted transition-colors duration-300 hover:border-botanical-bright hover:text-botanical-bright"
              >
                <ArrowsClockwise
                  weight="bold"
                  className="h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-180"
                />
                Re-run
              </button>
              <Segmented
                value={mode}
                onChange={(v) => setMode(v as "Admin" | "Student")}
                options={[
                  { value: "Admin", label: "Admin" },
                  { value: "Student", label: "Student view" },
                ]}
              />
            </div>
          </div>
        </section>

        {/* ── Data source toggle (confidence gate, live) ───────────────── */}
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl bg-panel px-6 py-4 shadow-[inset_0_1px_0_oklch(0.955_0.012_138_/_0.04)]">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            Data source
          </span>
          <Segmented
            value={dataMode}
            onChange={(v) => setDataMode(v as "full" | "estimate")}
            options={[
              { value: "full", label: "Full (entered)" },
              { value: "estimate", label: "Profile-only" },
            ]}
          />
          <span className="font-mono text-[11px] text-faint">
            {dataMode === "full"
              ? "Using our entered school usage figures."
              : "Every category estimated from medians for this size. Watch confidence drop."}
          </span>
        </div>

        {/* ── Headline instrument cluster ──────────────────────────────── */}
        <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-line sm:grid-cols-4">
          <Stat label="Annual CO₂e" unit="t">
            <ScrubCount value={Math.round(evidence.totals.annualCo2eKg / 1000)} />
          </Stat>
          <Stat label="Annual cost">
            <ScrubCount
              value={evidence.totals.annualCostUsd}
              format={(n) => formatCurrency(n)}
            />
          </Stat>
          <Stat label="Completeness" valueClass={completenessTone}>
            <span className="text-2xl">{dataCompletenessLabel}</span>
          </Stat>
          <Stat label="Top impact">
            <span className="flex items-center gap-2">
              {TopIcon && topImpactKey && (
                <TopIcon
                  weight="duotone"
                  className="h-5 w-5"
                  style={{ color: CATEGORY[topImpactKey].hex }}
                />
              )}
              <span className="text-2xl">{topImpactLabel}</span>
            </span>
          </Stat>
        </div>

        {mode === "Admin" ? (
          <>
            <div className="mt-8">
              <UsageEntry
                school={activeSchool}
                overrides={overrides}
                onChange={handleUsageChange}
              />
            </div>

            {/* Verdict + confidence */}
            <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <Reveal className="h-full">
                <div className="evidence-panel relative flex h-full flex-col justify-center overflow-hidden border-botanical p-6 sm:p-8">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute right-0 top-0 h-2 w-36 bg-botanical"
                  />
                  <p className="kicker flex items-center gap-2 text-signal">
                    <Sparkle weight="fill" className="h-3.5 w-3.5" />
                    What the analysis tells us
                  </p>
                  <p className="mt-6 font-display text-2xl font-semibold leading-[1.15] tracking-[-0.025em] text-fg sm:text-3xl">
                    {detective.overall_verdict}
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.08} className="h-full">
                <ConfidenceMeter
                  level={detective.confidence_level}
                  score={evidence.completenessScore}
                  explanation={detective.confidence_explanation}
                  missingCount={evidence.missingCategories.length}
                />
              </Reveal>
            </section>

            {/* Charts */}
            <section className="mt-8 grid gap-6 xl:grid-cols-2">
              <ChartCard title="Carbon footprint by category" unit="t CO₂e / year">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} width={32} />
                  <Tooltip
                    cursor={{ fill: "#ffffff08" }}
                    formatter={(v) => `${Math.round(Number(v))} t`}
                  />
                  <Bar dataKey="co2t" radius={[5, 5, 0, 0]} maxBarSize={56}>
                    {chartData.map((e) => (
                      <Cell key={e.category} fill={CATEGORY[e.category].hex} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartCard>
              <ChartCard title="Annual cost by category" unit="USD / year">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    width={44}
                    tickFormatter={(v) => `$${Math.round(Number(v) / 1000)}k`}
                  />
                  <Tooltip
                    cursor={{ fill: "#ffffff08" }}
                    formatter={(v) => formatCurrency(Number(v))}
                  />
                  <Bar dataKey="cost" radius={[5, 5, 0, 0]} maxBarSize={56}>
                    {chartData.map((e) => (
                      <Cell key={e.category} fill={CATEGORY[e.category].hex} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartCard>
            </section>

            {/* Ranked impacts */}
            <section className="mt-12">
              <Reveal>
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <h2 className="font-display text-3xl font-semibold leading-[1.05] tracking-[-0.035em] sm:text-4xl">
                    Our highest-impact opportunities
                  </h2>
                  <p className="font-mono text-[11px] uppercase tracking-wide text-faint">
                    Top {detective.top_impacts.length} · by carbon, cost, peer gap
                  </p>
                </div>
              </Reveal>
              <div className="mt-8">
                <StackedImpacts>
                  {detective.top_impacts.map((impact) => {
                    const key = keyFromLabel(impact.category);
                    return (
                      <ImpactCard
                        key={impact.rank}
                        impact={impact}
                        rebates={key ? rebatesForCategory(key) : []}
                      />
                    );
                  })}
                </StackedImpacts>
              </div>
            </section>

            {/* Peer benchmarking */}
            <Reveal>
              <section className="evidence-panel mt-12 p-6 sm:p-8">
                <p className="kicker">Peer benchmarking</p>
                <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                  How our school compares
                </h2>
                <p className="mt-3 max-w-[65ch] text-base leading-[1.55] text-muted">
                  Percentile across ~40 similar-size peer schools. The tick is the
                  peer median. Higher means more intensive, so more to gain.
                </p>
                {needsBuildingSize && (
                  <p className="mt-3 font-mono text-[11px] leading-relaxed text-amber">
                    Building square footage is not public, so energy-intensity
                    benchmarking stays audit-needed until that figure is added.
                  </p>
                )}
                <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {evidence.categories
                    .filter((c) => c.peerPercentile != null && c.benchmark)
                    .map((c) => (
                      <PeerGauge
                        key={c.category}
                        label={CATEGORY[c.category].label}
                        sublabel={c.benchmark!.label}
                        percentile={c.peerPercentile!}
                        value={c.intensityMetric!.value}
                        unit={c.intensityMetric!.unit}
                        median={c.benchmark!.median}
                        accent={CATEGORY[c.category].hex}
                      />
                    ))}
                </div>
              </section>
            </Reveal>

            <WhatIfSimulator school={effectiveSchool} />
          </>
        ) : (
          <StudentPitch
            schoolName={evidence.profile.name}
            verdict={detective.overall_verdict}
            points={studentPoints}
            co2t={Math.round(evidence.totals.annualCo2eKg / 1000)}
          />
        )}

        {/* Data disclosure */}
        <p className="mt-12 rounded-2xl bg-panel p-6 font-mono text-[11px] leading-relaxed text-faint shadow-[inset_0_1px_0_oklch(0.955_0.012_138_/_0.04)]">
          {isFlagship
            ? FLAGSHIP.dataNote
            : "This view was built from the school profile entered here. Categories marked estimated use published EPA, EIA, and DOE benchmark medians for a school this size and are weighted lower by the confidence gate. No private student data is required."}
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}

/* ── Header bits ──────────────────────────────────────────────────────── */

function Segmented({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="inline-flex border border-line-strong bg-ink p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className="relative px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] transition-colors"
          >
            {active && (
              <motion.span
                layoutId={`seg-${options.map((x) => x.value).join("-")}`}
                className="absolute inset-0 bg-botanical"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span
              className={`relative z-10 ${active ? "text-signal-ink" : "text-faint hover:text-fg"}`}
            >
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function SourcePill({ source }: { source: Source }) {
  if (source === "loading")
    return (
      <span className="inline-flex items-center gap-1.5 border border-amber/40 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber">
        <CircleNotch weight="bold" className="h-3 w-3 animate-spin" />
        Analyzing
      </span>
    );
  if (source === "ai")
    return (
      <span className="inline-flex items-center gap-1.5 border border-botanical px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-botanical-bright">
        <Sparkle weight="fill" className="h-3 w-3" />
        Claude live
      </span>
    );
  return (
    <span
      className="inline-flex items-center gap-1.5 border border-line-strong px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted"
      title="The Claude API key is not set or the call failed, so this is the deterministic offline estimate."
    >
      <PlugsConnected weight="bold" className="h-3 w-3" />
      Offline estimate
    </span>
  );
}

function Stat({
  label,
  unit,
  children,
  valueClass,
}: {
  label: string;
  unit?: string;
  children: ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="bg-ink-2 p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
        {label}
      </p>
      <p
        className={`mt-3 font-display text-3xl font-medium leading-none tracking-[-0.035em] tabular-nums lg:text-4xl ${valueClass ?? ""}`}
      >
        {children}
        {unit && <span className="ml-1 text-base text-faint">{unit}</span>}
      </p>
    </div>
  );
}

function ChartCard({
  title,
  unit,
  children,
}: {
  title: string;
  unit: string;
  children: ReactElement;
}) {
  return (
    <Reveal className="h-full">
      <div className="evidence-panel h-full p-6">
        <div className="flex items-baseline justify-between">
          <p className="font-display text-xl font-semibold leading-none tracking-[-0.02em]">
            {title}
          </p>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
            {unit}
          </span>
        </div>
        <div className="mt-5 h-64">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            initialDimension={{ width: 1, height: 1 }}
          >
            {children}
          </ResponsiveContainer>
        </div>
      </div>
    </Reveal>
  );
}

/* ── Student pitch view ───────────────────────────────────────────────── */

function StudentPitch({
  schoolName,
  verdict,
  points,
  co2t,
}: {
  schoolName: string;
  verdict: string;
  points: { category: string; headline: string; quickWin: string; save: string }[];
  co2t: number;
}) {
  return (
    <section className="mt-8 space-y-6">
      <Reveal>
        <div className="evidence-panel relative overflow-hidden border-botanical p-6 sm:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 h-2 w-40 bg-botanical"
          />
          <p className="kicker text-signal">
            Student view · made for our school community
          </p>
          <h2 className="mt-6 font-display text-3xl font-semibold leading-[1.05] tracking-[-0.035em] sm:text-4xl">
            Three things we can act on this year at {schoolName}.
          </h2>
          <p className="mt-4 max-w-[68ch] text-base leading-[1.6] text-muted">
            {verdict}
          </p>
        </div>
      </Reveal>

      <div className="grid gap-6 md:grid-cols-3">
        {points.map((p, i) => {
          const key = keyFromLabel(p.category);
          const Ico = key ? CATEGORY_ICON[key] : Sparkle;
          const hex = key ? CATEGORY[key].hex : "#19a974";
          return (
            <Reveal key={i} delay={i * 0.08} className="h-full">
              <div className="evidence-panel flex h-full flex-col p-6">
                <div className="flex items-center justify-between">
                  <span
                    className="grid h-10 w-10 place-items-center border"
                    style={{ borderColor: `${hex}55`, background: `${hex}14` }}
                  >
                    <Ico weight="duotone" className="h-5 w-5" style={{ color: hex }} />
                  </span>
                  <span className="font-display text-3xl font-semibold tabular-nums text-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
                  {p.category}
                </p>
                <p className="mt-1 font-display text-lg font-semibold leading-snug">
                  {p.headline}
                </p>
                {p.save && (
                  <p className="mt-2 font-mono text-[12px] text-signal">
                    Saves about {p.save}
                  </p>
                )}
                <p className="mt-auto pt-4 text-base leading-[1.5] text-muted">
                  <span className="font-medium text-fg">Start this week:</span>{" "}
                  {p.quickWin}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>

      <Reveal>
        <div className="evidence-panel p-8 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">
            One school · {co2t.toLocaleString()} tonnes of CO₂ a year · three
            changes we can start now
          </p>
          <p className="mt-3 font-display text-xl font-semibold tracking-tight sm:text-2xl">
            This is our shared view, in numbers our school can act on.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
