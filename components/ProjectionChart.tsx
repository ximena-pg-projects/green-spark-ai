// components/ProjectionChart.tsx
// 12-month projection: business-as-usual vs. after the selected fixes. This is
// the predictive-modeling capability the brief rewards — a forecast, not just a
// snapshot. Fixes are assumed to phase in over the first quarter, so the
// projected line trends down to the new steady state rather than dropping
// instantly (labeled as an assumption, not false precision).

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const MONTHS = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];

export function ProjectionChart({
  baselineAnnual,
  projectedAnnual,
  label,
  format,
}: {
  baselineAnnual: number;
  projectedAnnual: number;
  /** e.g. "t CO₂e" or "$" — used in the axis/legend. */
  label: string;
  format: (monthlyValue: number) => string;
}) {
  const baseMonthly = baselineAnnual / 12;
  const projMonthly = projectedAnnual / 12;

  const data = MONTHS.map((m, i) => {
    // Fixes ramp in linearly over the first 3 months, then hold.
    const phaseIn = Math.min(1, (i + 1) / 3);
    const projected = baseMonthly - (baseMonthly - projMonthly) * phaseIn;
    return {
      month: m,
      "Business as usual": Math.round(baseMonthly),
      "After fixes": Math.round(projected),
    };
  });

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="afterFixes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={12}
            width={48}
            tickFormatter={(v) => format(Number(v))}
          />
          <Tooltip formatter={(v) => `${format(Number(v))} ${label}/mo`} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area
            type="monotone"
            dataKey="Business as usual"
            stroke="#94a3b8"
            strokeDasharray="5 4"
            fill="none"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="After fixes"
            stroke="#10b981"
            fill="url(#afterFixes)"
            strokeWidth={2.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
