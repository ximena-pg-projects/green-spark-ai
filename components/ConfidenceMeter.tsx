// components/ConfidenceMeter.tsx
// The responsible-AI confidence gate, made visible. Shows the data-completeness
// score, the resulting confidence level, and the detective's own explanation of
// what is uncertain. This is the safeguard the brief asks for, on screen.

import type { ConfidenceLevel } from "@/lib/schema";

const STYLES: Record<
  ConfidenceLevel,
  { bar: string; badge: string; ring: string }
> = {
  High: {
    bar: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700",
    ring: "border-emerald-200",
  },
  Medium: {
    bar: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700",
    ring: "border-amber-200",
  },
  Low: {
    bar: "bg-rose-500",
    badge: "bg-rose-50 text-rose-700",
    ring: "border-rose-200",
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
  const s = STYLES[level];
  return (
    <div className={`rounded-3xl border bg-white p-6 shadow-sm ${s.ring}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
            Responsible AI · confidence gate
          </p>
          <h2 className="mt-1 text-2xl font-semibold">How sure is this?</h2>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${s.badge}`}
        >
          {level} confidence
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>Data completeness</span>
        <span className="font-semibold text-slate-700">{score}%</span>
      </div>
      <div
        className="mt-1 h-3 w-full overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all ${s.bar}`}
          style={{ width: `${Math.max(score, 2)}%` }}
        />
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-700">{explanation}</p>
      {missingCount > 0 && (
        <p className="mt-2 text-xs text-slate-500">
          {missingCount} categor{missingCount === 1 ? "y is" : "ies are"}{" "}
          missing or estimated. The detective weights those lower and says so
          rather than guessing.
        </p>
      )}
    </div>
  );
}
