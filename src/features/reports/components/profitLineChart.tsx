import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useDailyProfitSeries } from "@/features/reports/hooks/useReports"
import { formatPHPCompact } from "@/utils/currency"
import { formatDateShort } from "@/utils/date"

export function ProfitLineChart() {
  const { data: series = [], isLoading } = useDailyProfitSeries()

  const chartData = series.map((point) => ({
    ...point,
    label: formatDateShort(point.date),
  }))

  const hasAnyData = series.some((p) => p.sales > 0 || p.expenses > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profit &amp; loss</CardTitle>
        <p className="text-xs text-muted-foreground">Daily, this month</p>
      </CardHeader>
      <CardContent className="pb-5">
        {isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : !hasAnyData ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Add daily sales and expenses to see your profit trend here.
          </p>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ left: 4, right: 12, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0E4CE" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#8D6E63" }}
                  interval={Math.ceil(chartData.length / 8)}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#8D6E63" }}
                  tickFormatter={(value) => formatPHPCompact(value)}
                  width={56}
                />
                <Tooltip
                  formatter={(value, name) => [
                    formatPHPCompact(typeof value === "number" ? value : Number(value) || 0),
                    String(name),
                  ]}
                  contentStyle={{ borderRadius: 8, borderColor: "#E8D9C3", fontSize: 13 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="sales"
                  name="Sales"
                  stroke="#4C8C4A"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#C0392B"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  name="Net profit"
                  stroke="#E67E22"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}