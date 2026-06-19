"use client";

// components/UsageEntry.tsx
// ─────────────────────────────────────────────────────────────────────────────
// The "I have the real number" panel. One input per category for the headline
// usage figure (lib/usage.ts), with a plain-language note on where a student
// actually finds it. Typing a real number graduates that category from estimate
// to measured, which the confidence gate immediately rewards. Clearing a field
// falls back to the benchmark estimate. The parent owns the `overrides` state and
// applies it with withRealUsage(); this component is presentation only.
// ─────────────────────────────────────────────────────────────────────────────

import type { CategoryKey, SchoolData } from "@/lib/schema";
import { USAGE_FIELDS, getUsageValue } from "@/lib/usage";

const ORDER: CategoryKey[] = ["energy", "water", "waste", "transportation", "food"];
const ICON: Record<CategoryKey, string> = {
  energy: "⚡",
  water: "💧",
  waste: "🗑️",
  transportation: "🚌",
  food: "🍎",
};

function fmt(n: number | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

export function UsageEntry({
  school,
  overrides,
  onChange,
}: {
  /** The pre-override base school: drives placeholders and the estimated/measured badge. */
  school: SchoolData;
  overrides: Partial<Record<CategoryKey, number>>;
  onChange: (key: CategoryKey, value: number | undefined) => void;
}) {
  const estimated = new Set(school.estimatedCategories ?? []);
  // Measured if it was never an estimate, or the user has entered a real number.
  const isMeasured = (k: CategoryKey) => !estimated.has(k) || overrides[k] != null;
  const measuredCount = ORDER.filter(isMeasured).length;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
            Have real numbers? Enter them
          </p>
          <h2 className="mt-1 text-2xl font-semibold">
            Replace an estimate with a real figure to sharpen the analysis
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">
            You don&apos;t need any of these to get an analysis — the tool
            estimates them. But each real number you enter graduates that
            category from estimate to measured and pushes the confidence meter
            up. Clear a field to fall back to the estimate.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {measuredCount} of {ORDER.length} measured
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {ORDER.map((key) => {
          const field = USAGE_FIELDS[key];
          const baseValue = getUsageValue(school, key);
          const wasEstimated = estimated.has(key);
          const entered = overrides[key];
          const measured = isMeasured(key);
          return (
            <div key={key} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-700">
                  {ICON[key]} {field.label}
                </span>
                {measured ? (
                  <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                    ✓ Measured
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                    Estimated
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={entered ?? ""}
                  placeholder={
                    wasEstimated
                      ? `≈ ${fmt(baseValue)} (estimate)`
                      : `${fmt(baseValue)} (on file)`
                  }
                  onChange={(e) => {
                    const raw = e.target.value.trim();
                    if (raw === "") return onChange(key, undefined);
                    const n = Number(raw);
                    onChange(key, Number.isFinite(n) ? n : undefined);
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
                <span className="shrink-0 text-xs text-slate-400">{field.unit}</span>
              </div>
              <p className="mt-2 text-[11px] leading-4 text-slate-400">
                <span className="font-medium text-slate-500">Where to find it:</span>{" "}
                {field.source}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
