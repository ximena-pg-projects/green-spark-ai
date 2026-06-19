// components/PeerGauge.tsx
// Peer percentile gauge: where this school sits among ~40 similar-size peers for
// one category's intensity. Higher percentile = more intensive = more to gain.
// This is Layer-2 pattern detection made legible, not just a number.

export function PeerGauge({
  label,
  percentile,
  value,
  unit,
  median,
}: {
  label: string;
  percentile: number;
  value: number;
  unit: string;
  median?: number;
}) {
  // Higher intensity is worse, so green at the low end, rose at the high end.
  const tone =
    percentile >= 70
      ? { bar: "bg-rose-500", text: "text-rose-700" }
      : percentile >= 45
        ? { bar: "bg-amber-500", text: "text-amber-700" }
        : { bar: "bg-emerald-500", text: "text-emerald-700" };

  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <span className={`text-sm font-semibold ${tone.text}`}>
          {percentile}th percentile
        </span>
      </div>
      <div className="relative mt-3 h-2 w-full rounded-full bg-slate-100">
        <div
          className={`absolute left-0 top-0 h-2 rounded-full ${tone.bar}`}
          style={{ width: `${Math.max(2, Math.min(100, percentile))}%` }}
        />
        <div
          className="absolute -top-1 h-4 w-0.5 -translate-x-1/2 bg-slate-400"
          style={{ left: "50%" }}
          title="Peer median"
          aria-label="Peer median marker"
        />
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {value.toLocaleString()} {unit}
        {median != null && (
          <>
            {" "}
            · peer median {median.toLocaleString()} {unit}
          </>
        )}
      </p>
    </div>
  );
}
