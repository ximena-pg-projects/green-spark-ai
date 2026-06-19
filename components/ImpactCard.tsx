// components/ImpactCard.tsx
// Renders ONE ranked impact from the detective (Layer 3): the plain-language
// insight, the ROI recommendations it chose, and the zero-budget quick win.
// Every dollar figure carries the human-in-the-loop reminder that it is an
// estimate to verify with a real quote.

import type { ReactNode } from "react";
import type { TopImpact } from "@/lib/schema";
import type { Rebate } from "@/lib/rebates";
import { RebateBadge } from "./RebateBadge";

const ACCENT: Record<string, { dot: string; bar: string; chip: string }> = {
  Energy: { dot: "bg-emerald-500", bar: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700" },
  Water: { dot: "bg-sky-500", bar: "bg-sky-500", chip: "bg-sky-50 text-sky-700" },
  Waste: { dot: "bg-amber-500", bar: "bg-amber-500", chip: "bg-amber-50 text-amber-700" },
  Transportation: { dot: "bg-violet-500", bar: "bg-violet-500", chip: "bg-violet-50 text-violet-700" },
  Food: { dot: "bg-rose-500", bar: "bg-rose-500", chip: "bg-rose-50 text-rose-700" },
};

export function ImpactCard({
  impact,
  rebates,
  recommendationExtra,
}: {
  impact: TopImpact;
  /** Local/federal incentives that apply to this impact's category. */
  rebates?: Rebate[];
  /** Optional per-recommendation slot. */
  recommendationExtra?: (index: number) => ReactNode;
}) {
  const accent = ACCENT[impact.category] ?? ACCENT.Energy;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
            {impact.rank}
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Top impact #{impact.rank}
            </p>
            <h3 className="flex items-center gap-2 text-xl font-semibold">
              <span className={`h-2.5 w-2.5 rounded-full ${accent.dot}`} />
              {impact.category}
            </h3>
          </div>
        </div>
        <div className="w-28 shrink-0 text-right">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Impact score
          </p>
          <p className="text-lg font-semibold">{impact.impact_score}/100</p>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${accent.bar}`}
              style={{ width: `${Math.max(2, Math.min(100, impact.impact_score))}%` }}
            />
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-700">
        {impact.detective_insight}
      </p>

      <div className="mt-5 space-y-3">
        {impact.recommendations.map((rec, i) => (
          <div
            key={`${rec.action}-${i}`}
            className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
          >
            <p className="font-medium text-slate-900">{rec.action}</p>
            <p className="mt-1 text-sm text-slate-600">{rec.impact_reduction}</p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <span>
                <span className="text-slate-400">Saves </span>
                <span className="font-semibold text-emerald-700">
                  {rec.estimated_annual_savings}
                </span>
              </span>
              <span>
                <span className="text-slate-400">Payback </span>
                <span className="font-semibold">{rec.payback_period}</span>
              </span>
            </div>
            {recommendationExtra?.(i)}
          </div>
        ))}
      </div>

      <div className={`mt-4 rounded-2xl p-4 ${accent.chip}`}>
        <p className="text-xs font-semibold uppercase tracking-wide">
          ⚡ Quick win this week
        </p>
        <p className="mt-1 text-sm">{impact.quick_win}</p>
      </div>

      {rebates && rebates.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Local incentives
          </p>
          <div className="mt-2 space-y-2">
            {rebates.map((r) => (
              <RebateBadge key={r.id} rebate={r} />
            ))}
          </div>
        </div>
      )}

      <p className="mt-3 text-xs text-slate-400">
        Estimate to confirm with a vendor quote. The AI does not approve
        spending — a person decides what to fund.
      </p>
    </div>
  );
}
