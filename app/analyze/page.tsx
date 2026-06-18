'use client';

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
import { buildEvidencePacket } from "@/lib/benchmarks";
import { interventionsFor } from "@/lib/interventions";
import type { CategoryKey, SchoolData } from "@/lib/schema";

const school = demoSchool as unknown as SchoolData;
const evidence = buildEvidencePacket(school);

const CATEGORIES: { key: CategoryKey; label: string; icon: string }[] = [
  { key: "energy", label: "Energy", icon: "⚡" },
  { key: "water", label: "Water", icon: "💧" },
  { key: "waste", label: "Waste", icon: "🗑️" },
  { key: "transportation", label: "Transportation", icon: "🚌" },
  { key: "food", label: "Food", icon: "🍎" },
];

const COLORS = {
  energy: "#10b981",
  water: "#0ea5e9",
  waste: "#f59e0b",
  transportation: "#8b5cf6",
  food: "#ef4444",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function shortLabel(key: CategoryKey) {
  return CATEGORIES.find((item) => item.key === key)?.label ?? key;
}

function safeText(value: string | number | undefined, fallback = "Not available") {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
}

export default function AnalyzePage() {
  const [mode, setMode] = useState<"Admin" | "Student">("Admin");

  const chartData = useMemo(
    () =>
      evidence.categories.map((item) => ({
        name: shortLabel(item.category),
        impact: Math.max(item.annualCo2eKg / 1000, 0),
        cost: item.annualCostUsd,
        category: item.category,
      })),
    [],
  );

  const topCategory = useMemo(() => {
    const sorted = [...evidence.categories].sort(
      (a, b) => b.annualCo2eKg - a.annualCo2eKg,
    );
    return sorted[0] ?? null;
  }, []);

  const interventions = useMemo(
    () => interventionsFor(evidence.categories.map((item) => item.category)),
    [],
  );

  const recommendationCards = useMemo(() => {
    return interventions.map((intervention) => {
      const category = evidence.categories.find(
        (item) => item.category === intervention.category,
      );
      const savings = category
        ? Math.round(category.annualCostUsd * intervention.savingsPctOfCategory)
        : 0;
      return {
        ...intervention,
        savings,
        categoryLabel: shortLabel(intervention.category),
      };
    });
  }, []);

  const quickWin = useMemo(() => {
    return (
      recommendationCards.find((item) => item.quickWin) ??
      recommendationCards[0] ??
      null
    );
  }, [recommendationCards]);

  const detectiveNarrative = useMemo(() => {
    if (!topCategory) {
      return "The evidence set is still limited, so the detective recommends using the best available data with caution.";
    }

    const anomaly = topCategory.anomalyFlag
      ? `A major clue is ${topCategory.anomalyFlag.toLowerCase()}.`
      : "The category appears notably large compared with the school benchmark.";

    return `Upon closer inspection, the evidence suggests that ${shortLabel(
      topCategory.category,
    ).toLowerCase()} is your school's largest environmental impact. ${anomaly} The detective recommends focusing first on the actions with the strongest savings potential.`;
  }, [topCategory]);

  const studentTalkingPoints = useMemo(() => {
    return recommendationCards.slice(0, 3).map((item, index) => ({
      title: item.action,
      detail:
        index === 0
          ? "This is the most immediate way to reduce waste and cost."
          : "This can help your school show visible progress quickly.",
    }));
  }, [recommendationCards]);

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

      <main className="mx-auto w-full max-w-7xl px-6 pb-16">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                Case file
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight">
                {safeText(school.profile.name)}
              </h1>
              <p className="mt-1 text-slate-600">
                {safeText(school.profile.city)}, {safeText(school.profile.state)} · {safeText(school.profile.students)} students · {safeText(school.profile.squareFootage)} ft²
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMode("Admin")}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  mode === "Admin"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                Admin View
              </button>
              <button
                onClick={() => setMode("Student")}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  mode === "Student"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                Student Ambassador View
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-400">Estimated annual CO₂</p>
            <p className="mt-2 text-3xl font-semibold">{evidence.totals.annualCo2eKg.toLocaleString()} kg</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-400">Estimated annual cost</p>
            <p className="mt-2 text-3xl font-semibold">{formatCurrency(evidence.totals.annualCostUsd)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-400">Data completeness</p>
            <p className="mt-2 text-3xl font-semibold">{evidence.completenessScore}%</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-400">Top impact</p>
            <p className="mt-2 text-3xl font-semibold">{topCategory ? shortLabel(topCategory.category) : "Not available"}</p>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                  Responsible AI note
                </p>
                <h2 className="mt-1 text-2xl font-semibold">Data confidence</h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                {evidence.confidenceLevel} confidence
              </span>
            </div>
            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${evidence.completenessScore}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-slate-600">
              The AI Detective’s recommendations are based on the data provided. Missing or estimated data may affect accuracy.
            </p>
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-medium">Missing data warning</p>
              <p className="mt-1">
                {evidence.missingCategories.length > 0
                  ? `Missing categories: ${evidence.missingCategories.join(", ")}`
                  : "No missing categories detected for this demo."}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
              Environmental impact chart
            </p>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="impact" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell key={entry.category} fill={COLORS[entry.category] || "#0f766e"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
              Cost breakdown
            </p>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(typeof value === "number" ? value : Number(value ?? 0))
                    }
                  />
                  <Bar dataKey="cost" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell key={entry.category} fill={COLORS[entry.category] || "#0f766e"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
              AI Detective panel
            </p>
            <div className="mt-4 rounded-2xl bg-emerald-50 p-5">
              <p className="text-sm leading-6 text-slate-700">{detectiveNarrative}</p>
            </div>
            <div className="mt-4 space-y-3">
              {evidence.categories.slice(0, 4).map((item) => (
                <div key={item.category} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{shortLabel(item.category)}</p>
                    <span className="text-sm text-slate-500">{item.peerPercentile ?? 0}th percentile</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {item.anomalyFlag ?? "No major anomaly detected from the available data."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Recommendations</h2>
              <span className="text-sm text-slate-500">{recommendationCards.length} actions</span>
            </div>
            <div className="space-y-4">
              {recommendationCards.map((item) => (
                <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{item.categoryLabel}</p>
                      <h3 className="mt-1 text-xl font-semibold">{item.action}</h3>
                    </div>
                    <button className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                      Mark as Priority
                    </button>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{item.co2Note}</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">Estimated savings</p>
                      <p className="mt-1 font-semibold">{formatCurrency(item.savings)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">Payback</p>
                      <p className="mt-1 font-semibold">{item.paybackMonths[0] === item.paybackMonths[1] && item.paybackMonths[0] === 0 ? "Immediate" : `${item.paybackMonths[0]}–${item.paybackMonths[1]} months`}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">Confidence</p>
                      <p className="mt-1 font-semibold">{evidence.confidenceLevel}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {quickWin ? (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">Quick win</p>
                <h3 className="mt-2 text-2xl font-semibold">{quickWin.action}</h3>
                <p className="mt-3 text-sm text-slate-700">{quickWin.co2Note}</p>
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-white p-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Potential savings</p>
                    <p className="mt-1 font-semibold">{formatCurrency(quickWin.savings)}</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                    {quickWin.paybackMonths[0] === quickWin.paybackMonths[1] && quickWin.paybackMonths[0] === 0 ? "Immediate" : "Low cost"}
                  </span>
                </div>
              </div>
            ) : null}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                Peer benchmarking
              </p>
              <p className="mt-3 text-sm text-slate-600">
                Benchmarking data is not available yet. This section can later compare your school with similar schools.
              </p>
            </div>
          </div>
        </section>

        {mode === "Student" ? (
          <section className="mt-6 rounded-3xl border border-amber-100 bg-amber-50 p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
              Student ambassador mode
            </p>
            <div className="mt-3 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <ul className="space-y-3">
                  {studentTalkingPoints.map((item, index) => (
                    <li key={index} className="rounded-2xl bg-white p-4">
                      <p className="font-semibold">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Student-led action</p>
                <h3 className="mt-1 text-xl font-semibold">{quickWin?.action ?? "Start with a small waste reduction campaign"}</h3>
                <p className="mt-3 text-sm text-slate-600">
                  Use this as a simple first step to show progress and build momentum.
                </p>
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
