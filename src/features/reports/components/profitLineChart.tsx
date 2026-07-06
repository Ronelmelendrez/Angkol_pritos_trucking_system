import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { formatCurrencyCompact, formatCurrency } from "@/utils/currency";
import type { DailyProfitPoint } from "../types";

export function ProfitLineChart({ data }: { data: DailyProfitPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Daily profit &amp; loss</CardTitle>
          <CardDescription>Daily sales vs expenses tracked per batch</CardDescription>
        </div>
      </CardHeader>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: -10, right: 10, top: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }}
              interval="preserveStartEnd"
              axisLine={{ stroke: "var(--color-line)" }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => formatCurrencyCompact(v)}
              tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }}
              axisLine={false}
              tickLine={false}
              width={64}
            />
            <Tooltip
              formatter={(value, name) => [formatCurrency(Number(value ?? 0)), name]}
              contentStyle={{ borderRadius: 12, border: "1px solid var(--color-line)", fontSize: 13 }}
            />
            <Line type="monotone" dataKey="sales" name="Sales" stroke="#F1C40F" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#C0392B" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="profit" name="Profit" stroke="#E67E22" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}