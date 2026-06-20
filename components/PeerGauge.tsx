"use client";

// components/PeerGauge.tsx
// Peer percentile gauge: where this school sits among ~40 similar-size peers for
// one category's intensity. Higher percentile = more intensive = more to gain.
// Layer-2 pattern detection made legible. Bar color encodes severity (worse is
// rose); a small dot carries the category color; the tick marks the peer median.

import { motion, useReducedMotion } from "motion/react";

export function PeerGauge({
  label,
  sublabel,
  percentile,
  value,
  unit,
  median,
  accent,
}: {
  label: string;
  sublabel?: string;
  percentile: number;
  value: number;
  unit: string;
  median?: number;
  accent?: string;
}) {
  const reduce = useReducedMotion();
  const tone =
    percentile >= 70
      ? { bar: "var(--color-rose)", text: "text-rose" }
      : percentile >= 45
        ? { bar: "var(--color-amber)", text: "text-amber" }
        : { bar: "var(--color-signal)", text: "text-signal" };

  return (
    <div className="rounded-xl bg-ink-2 p-5 shadow-[inset_0_1px_0_oklch(0.955_0.012_138_/_0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {accent && (
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: accent }}
            />
          )}
          <div>
            <p className="text-sm font-medium text-fg">{label}</p>
            {sublabel && (
              <p className="font-mono text-[10px] uppercase tracking-wide text-faint">
                {sublabel}
              </p>
            )}
          </div>
        </div>
        <span className={`shrink-0 font-mono text-sm font-semibold tabular-nums ${tone.text}`}>
          {percentile}
          <span className="text-[10px] text-faint">th</span>
        </span>
      </div>

      <div className="relative mt-3.5 h-2 w-full bg-panel-2">
        <motion.div
          className="absolute left-0 top-0 h-2"
          style={{ background: tone.bar }}
          initial={reduce ? false : { width: 0 }}
          whileInView={{ width: `${Math.max(2, Math.min(100, percentile))}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
        <div
          className="absolute -top-1 h-4 w-px -translate-x-1/2 bg-line-strong"
          style={{ left: "50%" }}
          title="Peer median"
          aria-label="Peer median marker"
        />
      </div>

      <p className="mt-2.5 font-mono text-[11px] tabular-nums text-faint">
        {value.toLocaleString()} {unit}
        {median != null && (
          <>
            {" "}
            <span className="text-muted">·</span> median{" "}
            {median.toLocaleString()} {unit}
          </>
        )}
      </p>
    </div>
  );
}
