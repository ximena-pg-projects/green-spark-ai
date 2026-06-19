"use client";

// components/WhatIfSimulator.tsx
// The interactive heart of the demo. Toggling a fix recomputes the whole
// footprint CLIENT-SIDE via the pure lib/simulate.ts (no API call, instant,
// free) and updates the live CO2 / cost / payback readout and the 12-month
// projection. This is "show how specific behaviors affect outcomes" made
// tangible — the judge can drag the levers themselves.

import { useMemo, useState } from "react";
import { INTERVENTIONS } from "@/lib/interventions";
import { simulate } from "@/lib/simulate";
import type { CategoryKey, SchoolData } from "@/lib/schema";
import { ProjectionChart } from "./ProjectionChart";

const CATEGORY_LABEL: Record<CategoryKey, { label: string; icon: string }> = {
  energy: { label: "Energy", icon: "⚡" },
  water: { label: "Water", icon: "💧" },
  waste: { label: "Waste", icon: "🗑️" },
  transportation: { label: "Transportation", icon: "🚌" },
  food: { label: "Food", icon: "🍎" },
};

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
  // Default ON: the zero-budget quick wins ("start with the free wins").
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(INTERVENTIONS.filter((i) => i.quickWin).map((i) => i.id)),
  );
  const [metric, setMetric] = useState<"co2" | "cost">("cost");

  // Only show interventions for categories the school actually has data on.
  const available = useMemo(() => {
    const result = simulate(school, []);
    const present = new Set(result.baseline.categories.map((c) => c.category));
    return INTERVENTIONS.filter((i) => present.has(i.category));
  }, [school]);

  const result = useMemo(
    () => simulate(school, [...selected]),
    [school, selected],
  );

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
  const co2Pct =
    baselineCo2T > 0 ? Math.round((co2SavedT / baselineCo2T) * 100) : 0;

  return (
    <section
      id="what-if"
      className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
            What-if simulator
          </p>
          <h2 className="mt-1 text-2xl font-semibold">
            Drag the levers, watch the footprint move
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Every toggle recomputes instantly in your browser. Quick wins are on
            by default because they cost nothing.
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          {selected.size} fix{selected.size === 1 ? "" : "es"} applied
        </span>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_1.05fr]">
        {/* Controls */}
        <div className="space-y-5">
          {grouped.map(([cat, list]) => (
            <div key={cat}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {CATEGORY_LABEL[cat].icon} {CATEGORY_LABEL[cat].label}
              </p>
              <div className="space-y-2">
                {list.map((iv) => {
                  const on = selected.has(iv.id);
                  return (
                    <button
                      key={iv.id}
                      onClick={() => toggle(iv.id)}
                      aria-pressed={on}
                      className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition-colors ${
                        on
                          ? "border-emerald-300 bg-emerald-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs ${
                          on
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-slate-300 bg-white text-transparent"
                        }`}
                      >
                        ✓
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-medium text-slate-800">
                          {iv.action}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-500">
                          ~{Math.round(iv.savingsPctOfCategory * 100)}% of category
                          · payback {payback(iv.paybackMonths)}
                          {iv.quickWin ? " · quick win" : ""}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Live results */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs uppercase tracking-wide text-emerald-700">
                Annual savings
              </p>
              <p className="mt-1 text-2xl font-semibold text-emerald-800">
                {usd(costSaved)}
              </p>
              <p className="text-xs text-slate-500">
                from {usd(result.baseline.totals.annualCostUsd)} →{" "}
                {usd(result.projected.totals.annualCostUsd)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                CO₂ avoided
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {co2SavedT.toLocaleString()} t
              </p>
              <p className="text-xs text-slate-500">
                {co2Pct}% of the footprint ·{" "}
                {Math.round(projectedCo2T).toLocaleString()} t remaining
              </p>
            </div>
          </div>

          {result.combinedPaybackMonthsRange && (
            <p className="rounded-2xl bg-slate-100 px-4 py-2 text-xs text-slate-600">
              Upfront fixes pay back in roughly{" "}
              <span className="font-semibold">
                {result.combinedPaybackMonthsRange[0]}–
                {result.combinedPaybackMonthsRange[1]} months
              </span>
              ; the immediate, no-cost fixes save{" "}
              <span className="font-semibold">
                {usd(result.immediateAnnualSavingsUsd)}
              </span>{" "}
              a year on their own.
            </p>
          )}

          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">
                12-month projection
              </p>
              <div className="flex items-center gap-1 rounded-full bg-slate-100 p-0.5 text-xs">
                <button
                  onClick={() => setMetric("cost")}
                  className={`rounded-full px-2.5 py-1 font-medium ${metric === "cost" ? "bg-white shadow-sm" : "text-slate-500"}`}
                >
                  Cost
                </button>
                <button
                  onClick={() => setMetric("co2")}
                  className={`rounded-full px-2.5 py-1 font-medium ${metric === "co2" ? "bg-white shadow-sm" : "text-slate-500"}`}
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
            <ul className="space-y-1 text-xs text-amber-700">
              {result.warnings.map((w, i) => (
                <li key={i}>⚠ {w}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
