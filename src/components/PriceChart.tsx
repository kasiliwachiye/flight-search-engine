"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/format";
import type { TrendDatum } from "@/lib/priceTrend";

const chartColorOutbound = "var(--color-chart-1)";
const chartColorReturn = "var(--color-chart-2)";

type PriceChartProps = {
  data: TrendDatum[];
  currency: string;
};

export default function PriceChart({ data, currency }: PriceChartProps) {
  const hasReturn = data.some((point) => typeof point.return === "number");

  return (
    <div className="rounded-3xl border border-border bg-white/80 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Price trend
          </p>
          <p className="text-sm text-muted">
            Derived from current results and filters
          </p>
        </div>
        <span className="text-xs uppercase tracking-[0.2em] text-muted">
          {currency}
        </span>
      </div>

      <div className="mt-4 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.08)" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#647079", fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#647079", fontSize: 11 }}
              tickFormatter={(value) => formatCurrency(Number(value), currency)}
              width={80}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value), currency)}
              labelStyle={{ color: "#111827" }}
              contentStyle={{
                borderRadius: 12,
                borderColor: "rgba(0,0,0,0.08)",
              }}
            />
            {hasReturn && <Legend verticalAlign="top" height={24} />}
            <Line
              type="monotone"
              dataKey="outbound"
              stroke={chartColorOutbound}
              strokeWidth={2}
              dot={false}
              name="Outbound"
              connectNulls={false}
            />
            {hasReturn && (
              <Line
                type="monotone"
                dataKey="return"
                stroke={chartColorReturn}
                strokeWidth={2}
                dot={false}
                name="Return"
                connectNulls={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

