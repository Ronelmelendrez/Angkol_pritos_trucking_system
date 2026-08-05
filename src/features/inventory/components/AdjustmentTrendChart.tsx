import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { formatCurrencyCompact } from "@/utils/currency";
import { useChartLabelCount, chartXInterval } from "@/utils/chartTicks";
import type { AdjustmentTrendPoint } from "../hooks/useAdjustmentReport";

interface Props {
  data: AdjustmentTrendPoint[];
}

export function AdjustmentTrendChart({ data }: Props) {
  const labelCount = useChartLabelCount();
  const xInterval = chartXInterval(data.length, labelCount);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Loss trend</CardTitle>
          <CardDescription>Est. ₱ lost per day</CardDescription>
        </div>
      </CardHeader>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 0, right: 12, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="adjustmentGradient" x1="0" y1="0" x2="0" y2="1">
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
              fill="url(#adjustmentGradient)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
