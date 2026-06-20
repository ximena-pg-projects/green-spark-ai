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

import { CheckCircle } from "@phosphor-icons/react";
import type { CategoryKey, SchoolData } from "@/lib/schema";
import { USAGE_FIELDS, getUsageValue } from "@/lib/usage";
import { CATEGORY, CATEGORY_KEYS } from "@/lib/theme";
import { CATEGORY_ICON } from "@/lib/icons";

function fmt(n: number | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

export function UsageEntry({
  school,
  overrides,
  onChange,
}: {
  school: SchoolData;
  overrides: Partial<Record<CategoryKey, number>>;
  onChange: (key: CategoryKey, value: number | undefined) => void;
}) {
  const estimated = new Set(school.estimatedCategories ?? []);
  const isMeasured = (k: CategoryKey) =>
    (getUsageValue(school, k) != null && !estimated.has(k)) || overrides[k] != null;
  const measuredCount = CATEGORY_KEYS.filter(isMeasured).length;

  return (
    <section className="evidence-panel p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="kicker">Have real numbers? Enter them</p>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-none tracking-[-0.025em]">
            Swap an estimate for a real figure
          </h2>
          <p className="mt-4 max-w-[68ch] text-base leading-[1.55] text-muted">
            You don&apos;t need any of these to get an analysis. But each real
            number graduates that category from estimate to measured and pushes
            the confidence meter up. Clear a field to fall back to the estimate.
          </p>
        </div>
        <span className="shrink-0 border border-line-strong px-3 py-1.5 font-mono text-[10px] font-bold tabular-nums text-muted">
          {measuredCount} / {CATEGORY_KEYS.length} measured
        </span>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {CATEGORY_KEYS.map((key) => {
          const field = USAGE_FIELDS[key];
          const baseValue = getUsageValue(school, key);
          const wasEstimated = estimated.has(key);
          const entered = overrides[key];
          const measured = isMeasured(key);
          const meta = CATEGORY[key];
          const Ico = CATEGORY_ICON[key];
          return (
            <div
              key={key}
              className="rounded-xl bg-ink p-4 shadow-[inset_0_1px_0_oklch(0.955_0.012_138_/_0.04)] transition-shadow focus-within:shadow-[inset_0_0_0_1px_var(--color-botanical)]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-medium text-fg">
                  <Ico
                    weight="duotone"
                    className="h-4 w-4"
                    style={{ color: meta.hex }}
                  />
                  {field.label}
                </span>
                {measured ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-signal/30 bg-signal/10 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide text-signal">
                    <CheckCircle weight="fill" className="h-3 w-3" />
                    Measured
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full border border-amber/30 bg-amber/10 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide text-amber">
                    Estimated
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center gap-2">
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
                  className="w-full border border-line-strong bg-panel px-3 py-2 text-sm tabular-nums text-fg outline-none transition-colors placeholder:text-faint focus:border-botanical"
                />
                <span className="shrink-0 font-mono text-[11px] text-faint">
                  {field.unit}
                </span>
              </div>
              <p className="mt-2.5 font-mono text-[10px] leading-4 text-faint">
                <span className="text-muted">Find it:</span> {field.source}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
