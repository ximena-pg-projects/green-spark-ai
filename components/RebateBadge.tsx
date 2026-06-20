"use client";

// components/RebateBadge.tsx
// Surfaces a matched local/federal incentive on a recommendation. Turning a
// a generic fix into "and a local incentive can reduce the cost" is what makes
// the action feel local and doable.

import { Gift } from "@phosphor-icons/react";
import type { Rebate } from "@/lib/rebates";

export function RebateBadge({ rebate }: { rebate: Rebate }) {
  return (
    <div className="rounded-xl bg-botanical/[0.1] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-signal">
          <Gift weight="duotone" className="h-4 w-4" />
          {rebate.program}
        </span>
        <span className="rounded-full bg-white/5 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-muted">
          {rebate.region} · {rebate.kind}
        </span>
      </div>
      <p className="mt-1.5 line-clamp-2 text-[11px] leading-[1.45] text-muted">
        {rebate.summary}
      </p>
    </div>
  );
}
