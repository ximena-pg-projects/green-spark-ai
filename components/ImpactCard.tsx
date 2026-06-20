"use client";

// components/ImpactCard.tsx
// A ranked opportunity is composed as a wide evidence sheet: context and the
// immediate move live on the left, while the costed recommendations read down
// the right. This keeps every card legible inside the pinned horizontal rail.

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Lightning } from "@phosphor-icons/react";
import type { TopImpact } from "@/lib/schema";
import type { Rebate } from "@/lib/rebates";
import { CATEGORY, keyFromLabel } from "@/lib/theme";
import { CATEGORY_ICON } from "@/lib/icons";
import { RebateBadge } from "./RebateBadge";

export function ImpactCard({
  impact,
  rebates,
  recommendationExtra,
}: {
  impact: TopImpact;
  rebates?: Rebate[];
  recommendationExtra?: (index: number) => ReactNode;
}) {
  const reduce = useReducedMotion();
  const key = keyFromLabel(impact.category);
  const meta = key ? CATEGORY[key] : undefined;
  const Ico = key ? CATEGORY_ICON[key] : Lightning;
  const accent = meta?.hex ?? "#19a974";

  return (
    <div className="evidence-panel h-full p-6 sm:p-8">
      <div className="grid h-full gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-10">
        <div className="flex min-w-0 flex-col">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                className="grid h-11 w-11 place-items-center rounded-xl"
                style={{ background: `${accent}1f` }}
              >
                <Ico weight="duotone" className="h-5 w-5" style={{ color: accent }} />
              </span>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
                  Rank {String(impact.rank).padStart(2, "0")}
                </p>
                <h3 className="font-display text-xl font-semibold tracking-tight">
                  {impact.category}
                </h3>
              </div>
            </div>
            <div className="w-24 shrink-0 text-right">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                Impact
              </p>
              <p className="font-display text-lg font-semibold tabular-nums">
                {impact.impact_score}
                <span className="text-sm text-faint">/100</span>
              </p>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: accent }}
                  initial={reduce ? false : { width: 0 }}
                  whileInView={{
                    width: `${Math.max(2, Math.min(100, impact.impact_score))}%`,
                  }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
          </div>

          <p className="mt-4 text-base leading-[1.55] text-muted">
            {impact.detective_insight}
          </p>

          <div className="mt-4 rounded-xl p-3.5" style={{ background: `${accent}12` }}>
            <p
              className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: accent }}
            >
              <Lightning weight="fill" className="h-3.5 w-3.5" />
              Quick win this week
            </p>
            <p className="mt-2 text-[15px] leading-[1.45] text-fg">
              {impact.quick_win}
            </p>
          </div>

          {rebates && rebates.length > 0 && (
            <div className="mt-4">
              <p className="kicker">Local incentives</p>
              <div className="mt-2 space-y-1.5">
                {rebates.map((rebate) => (
                  <RebateBadge key={rebate.id} rebate={rebate} />
                ))}
              </div>
            </div>
          )}

          <p className="mt-auto pt-4 font-mono text-[10px] leading-5 text-faint">
            Estimate to confirm with a vendor quote. The AI does not approve
            spending. A person decides what to fund.
          </p>
        </div>

        <div className="min-w-0 lg:border-l lg:border-line lg:pl-10">
          <p className="kicker">Recommended moves</p>
          <div className="mt-3 divide-y divide-line">
            {impact.recommendations.map((rec, index) => (
              <div key={`${rec.action}-${index}`} className="py-4 first:pt-2 last:pb-0">
                <p className="text-base font-medium text-fg">{rec.action}</p>
                <p className="mt-2 text-[15px] leading-[1.5] text-muted">
                  {rec.impact_reduction}
                </p>
                <div className="mt-2.5 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[10px] uppercase tracking-wide">
                  <span className="text-faint">
                    Saves{" "}
                    <span className="text-signal">{rec.estimated_annual_savings}</span>
                  </span>
                  <span className="text-faint">
                    Payback <span className="text-fg">{rec.payback_period}</span>
                  </span>
                </div>
                {recommendationExtra?.(index)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
