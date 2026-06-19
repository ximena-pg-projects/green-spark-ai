// components/RebateBadge.tsx
// Surfaces a matched local/federal incentive on a recommendation. Turning a
// generic fix into "and Austin Energy rebates part of the cost" is what makes
// the action feel local and doable.

import type { Rebate } from "@/lib/rebates";

export function RebateBadge({ rebate }: { rebate: Rebate }) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-emerald-800">
          🎁 {rebate.program}
        </span>
        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-emerald-700">
          {rebate.region} · {rebate.kind}
        </span>
      </div>
      <p className="mt-1 text-xs leading-5 text-slate-600">{rebate.summary}</p>
    </div>
  );
}
