"use client";

// components/ConfidenceMeter.tsx
// The responsible-AI confidence gate, made visible. Shows the data-completeness
// score, the resulting confidence level, and the detective's own explanation of
// what is uncertain. This is the safeguard the brief asks for, on screen.

import { motion, useReducedMotion } from "motion/react";
import { ShieldCheck, Warning, SealCheck } from "@phosphor-icons/react";
import type { ConfidenceLevel } from "@/lib/schema";

const STYLES: Record<
  ConfidenceLevel,
  { text: string; bar: string; chip: string; icon: typeof ShieldCheck }
> = {
  High: {
    text: "text-signal",
    bar: "bg-signal",
    chip: "border-signal/30 bg-signal/10 text-signal",
    icon: SealCheck,
  },
  Medium: {
    text: "text-amber",
    bar: "bg-amber",
    chip: "border-amber/30 bg-amber/10 text-amber",
    icon: ShieldCheck,
  },
  Low: {
    text: "text-rose",
    bar: "bg-rose",
    chip: "border-rose/30 bg-rose/10 text-rose",
    icon: Warning,
  },
};

export function ConfidenceMeter({
  level,
  score,
  explanation,
  missingCount,
}: {
  level: ConfidenceLevel;
  score: number;
  explanation: string;
  missingCount: number;
}) {
  const reduce = useReducedMotion();
  const s = STYLES[level];
  const Ico = s.icon;

  return (
    <div className="evidence-panel flex h-full flex-col p-6 sm:p-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="kicker">Responsible AI · confidence gate</p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">
            How sure is this?
          </h2>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 border px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${s.chip}`}
        >
          <Ico weight="fill" className="h-3.5 w-3.5" />
          {level}
        </span>
      </div>

      <div className="mt-6">
        <div className="flex items-end justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
          <span>Data completeness</span>
          <span className={`text-lg ${s.text}`}>{score}%</span>
        </div>
        <div
          className="mt-2 h-2.5 w-full overflow-hidden bg-ink"
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <motion.div
            className={`h-full ${s.bar}`}
            initial={reduce ? false : { width: 0 }}
            whileInView={{ width: `${Math.max(score, 2)}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      <p className="mt-6 text-base leading-[1.55] text-muted">{explanation}</p>
      {missingCount > 0 && (
        <p className="mt-auto pt-4 font-mono text-[11px] leading-5 text-faint">
          {missingCount} categor{missingCount === 1 ? "y is" : "ies are"} missing
          or estimated. The detective weights those lower and says so rather than
          guessing.
        </p>
      )}
    </div>
  );
}
