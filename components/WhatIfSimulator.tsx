"use client";

// components/WhatIfSimulator.tsx
// The interactive heart of the demo. Toggling a fix recomputes the whole
// footprint CLIENT-SIDE via the pure lib/simulate.ts (no API call, instant,
// free) and updates the live CO2 / cost / payback readout and the 12-month
// projection. This is "show how specific behaviors affect outcomes" made
// tangible: the judge can drag the levers themselves.

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check, SlidersHorizontal, Warning } from "@phosphor-icons/react";
import { INTERVENTIONS } from "@/lib/interventions";
import { simulate } from "@/lib/simulate";
import { CATEGORY } from "@/lib/theme";
import { CATEGORY_ICON } from "@/lib/icons";
import type { CategoryKey, SchoolData } from "@/lib/schema";
import { ProjectionChart } from "./ProjectionChart";

function usd(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function payback(months: [number, number]) {
  if (months[0] === 0 && months[1] === 0) return "Immediate";
  return `${months[0]}–${months[1]} mo`;
}

export function WhatIfSimulator({ school }: { school: SchoolData }) {
  const reduce = useReducedMotion();
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(INTERVENTIONS.filter((i) => i.quickWin).map((i) => i.id)),
  );
  const [metric, setMetric] = useState<"co2" | "cost">("cost");

  const available = useMemo(() => {
    const result = simulate(school, []);
    const present = new Set(result.baseline.categories.map((c) => c.category));
    return INTERVENTIONS.filter((i) => present.has(i.category));
  }, [school]);

  const result = useMemo(() => simulate(school, [...selected]), [school, selected]);

  const grouped = useMemo(() => {
    const map = new Map<CategoryKey, typeof available>();
    for (const iv of available) {
      const list = map.get(iv.category) ?? [];
      list.push(iv);
      map.set(iv.category, list);
    }
    return [...map.entries()];
  }, [available]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const co2SavedT = Math.round(-result.delta.annualCo2eKg / 1000);
  const costSaved = -result.delta.annualCostUsd;
  const baselineCo2T = result.baseline.totals.annualCo2eKg / 1000;
  const projectedCo2T = result.projected.totals.annualCo2eKg / 1000;
  const co2Pct = baselineCo2T > 0 ? Math.round((co2SavedT / baselineCo2T) * 100) : 0;

  return (
    <section id="what-if" className="evidence-panel mt-8 p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="kicker flex items-center gap-2">
            <SlidersHorizontal weight="duotone" className="h-4 w-4 text-signal" />
            What-if simulator
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-none tracking-[-0.025em]">
            Drag the levers, watch the footprint move
          </h2>
          <p className="mt-4 max-w-[60ch] text-base leading-[1.55] text-muted">
            Every toggle recomputes instantly in your browser. Quick wins are on
            by default because they cost nothing.
          </p>
        </div>
        <span className="border border-botanical px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wide text-botanical-bright">
          {selected.size} fix{selected.size === 1 ? "" : "es"} applied
        </span>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.05fr]">
        {/* Controls */}
        <div className="space-y-5">
          {grouped.map(([cat, list]) => {
            const meta = CATEGORY[cat];
            const Ico = CATEGORY_ICON[cat];
            return (
              <div key={cat}>
                <p className="mb-2.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
                  <Ico weight="duotone" className="h-4 w-4" style={{ color: meta.hex }} />
                  {meta.label}
                </p>
                <div className="space-y-2">
                  {list.map((iv) => {
                    const on = selected.has(iv.id);
                    return (
                      <button
                        key={iv.id}
                        onClick={() => toggle(iv.id)}
                        aria-pressed={on}
                        className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition-all duration-200 ${
                          on
                            ? "bg-signal/[0.1] shadow-[inset_0_0_0_1px_oklch(0.66_0.16_158_/_0.2)]"
                            : "bg-white/[0.025] hover:bg-white/[0.045]"
                        }`}
                      >
                        <span
                          className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors ${
                            on
                              ? "border-signal bg-signal text-signal-ink"
                              : "border-line-strong bg-transparent text-transparent"
                          }`}
                        >
                          <Check weight="bold" className="h-3 w-3" />
                        </span>
                        <span className="flex-1">
                          <span className="block text-sm font-medium text-fg">
                            {iv.action}
                          </span>
                          <span className="mt-0.5 block font-mono text-[11px] text-faint">
                            ~{Math.round(iv.savingsPctOfCategory * 100)}% of category ·
                            payback {payback(iv.paybackMonths)}
                            {iv.quickWin ? " · quick win" : ""}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Live results */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-botanical/[0.1] p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-signal">
                Annual savings
              </p>
              <motion.p
                key={costSaved}
                initial={reduce ? false : { opacity: 0.4, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-1.5 font-display text-2xl font-semibold tabular-nums text-signal"
              >
                {usd(costSaved)}
              </motion.p>
              <p className="mt-1 font-mono text-[10px] text-faint">
                {usd(result.baseline.totals.annualCostUsd)} →{" "}
                {usd(result.projected.totals.annualCostUsd)}
              </p>
            </div>
            <div className="rounded-xl bg-ink p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                CO₂ avoided
              </p>
              <motion.p
                key={co2SavedT}
                initial={reduce ? false : { opacity: 0.4, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-1.5 font-display text-2xl font-semibold tabular-nums text-fg"
              >
                {co2SavedT.toLocaleString()} t
              </motion.p>
              <p className="mt-1 font-mono text-[10px] text-faint">
                {co2Pct}% of footprint · {Math.round(projectedCo2T).toLocaleString()} t left
              </p>
            </div>
          </div>

          {result.combinedPaybackMonthsRange && (
            <p className="rounded-xl bg-ink px-4 py-3 text-[13px] leading-relaxed text-muted">
              Upfront fixes pay back in roughly{" "}
              <span className="font-semibold text-fg">
                {result.combinedPaybackMonthsRange[0]}–
                {result.combinedPaybackMonthsRange[1]} months
              </span>
              ; the no-cost fixes save{" "}
              <span className="font-semibold text-signal">
                {usd(result.immediateAnnualSavingsUsd)}
              </span>{" "}
              a year on their own.
            </p>
          )}

          <div className="rounded-xl bg-ink p-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                12-month projection
              </p>
              <div className="flex items-center gap-1 rounded-full border border-line bg-white/5 p-0.5 font-mono text-[11px]">
                <button
                  onClick={() => setMetric("cost")}
                  className={`rounded-full px-2.5 py-1 transition-colors ${
                    metric === "cost"
                      ? "bg-signal text-signal-ink"
                      : "text-faint hover:text-fg"
                  }`}
                >
                  Cost
                </button>
                <button
                  onClick={() => setMetric("co2")}
                  className={`rounded-full px-2.5 py-1 transition-colors ${
                    metric === "co2"
                      ? "bg-signal text-signal-ink"
                      : "text-faint hover:text-fg"
                  }`}
                >
                  CO₂
                </button>
              </div>
            </div>
            <div className="mt-3">
              {metric === "cost" ? (
                <ProjectionChart
                  baselineAnnual={result.baseline.totals.annualCostUsd}
                  projectedAnnual={result.projected.totals.annualCostUsd}
                  label="$"
                  format={(v) => usd(v)}
                />
              ) : (
                <ProjectionChart
                  baselineAnnual={result.baseline.totals.annualCo2eKg / 1000}
                  projectedAnnual={result.projected.totals.annualCo2eKg / 1000}
                  label="t CO₂e"
                  format={(v) => `${Math.round(v)} t`}
                />
              )}
            </div>
          </div>

          {result.warnings.length > 0 && (
            <ul className="space-y-1.5">
              {result.warnings.map((w, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 font-mono text-[11px] leading-5 text-amber"
                >
                  <Warning weight="fill" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {w}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
