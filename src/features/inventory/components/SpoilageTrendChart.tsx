import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatCurrencyCompact } from "@/utils/currency";
import { useChartLabelCount, chartXInterval } from "@/utils/chartTicks";
import type { SpoilageTrendPoint } from "../hooks/useSpoilageReport";

interface Props {
  data: SpoilageTrendPoint[];
}

export function SpoilageTrendChart({ data }: Props) {
  const labelCount = useChartLabelCount();
  const xInterval = chartXInterval(data.length, labelCount);

  return (
    <div className="h-64">
      <p className="mb-2 text-xs font-medium text-ink-faint">Est. ₱ lost to spoilage per day</p>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 12, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="spoilageGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C0392B" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#C0392B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }}
            axisLine={{ stroke: "var(--color-line)" }}
            tickLine={false}
            interval={xInterval}
            padding={{ left: 12, right: 12 }}
            tickMargin={8}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }}
            tickFormatter={(v) => formatCurrencyCompact(Number(v))}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip
            formatter={(value) => [formatCurrencyCompact(Number(value)), "Lost"]}
            contentStyle={{ borderRadius: 12, border: "1px solid var(--color-line)", fontSize: 13 }}
          />
          <Area
            type="monotone"
            dataKey="cost"
            stroke="#C0392B"
            strokeWidth={2}
            fill="url(#spoilageGradient)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
