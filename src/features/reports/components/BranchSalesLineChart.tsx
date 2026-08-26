import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useBranchSalesOverTime } from "@/features/sales/hooks/useBranchSales";
import { formatCurrency, formatCurrencyCompact } from "@/utils/currency";
import { useChartLabelCount, chartXInterval } from "@/utils/chartTicks";

const BRANCH_COLORS = [
  "#F1C40F",
  "#E67E22",
  "#2ECC71",
  "#3498DB",
  "#9B59B6",
  "#E74C3C",
  "#1ABC9C",
  "#E67E22",
];

interface Props {
  dateFrom: string;
  dateTo: string;
}

export function BranchSalesLineChart({ dateFrom, dateTo }: Props) {
  const { data, isLoading } = useBranchSalesOverTime(dateFrom, dateTo);
  const labelCount = useChartLabelCount();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Branch sales over time</CardTitle>
        </CardHeader>
        <Skeleton className="h-64 w-full" />
      </Card>
    );
  }

  if (!data || data.branchNames.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Branch sales over time</CardTitle>
          <CardDescription>No sales data for this period</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Branch sales over time</CardTitle>
        <CardDescription>Daily sales per branch</CardDescription>
      </CardHeader>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.data} margin={{ left: 0, right: 12, top: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }}
              interval={chartXInterval(data.data.length, labelCount)}
              padding={{ left: 12, right: 12 }}
              tickMargin={8}
              axisLine={{ stroke: "var(--color-line)" }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => formatCurrencyCompact(v)}
              tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value ?? 0))}
              contentStyle={{ borderRadius: 12, border: "1px solid var(--color-line)", fontSize: 13 }}
            />
            <Legend
              verticalAlign="top"
              height={32}
              iconType="circle"
              iconSize={8}
              formatter={(value) => <span className="text-xs text-ink-soft">{value}</span>}
            />
            {data.branchNames.map((name, i) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                name={name}
                stroke={BRANCH_COLORS[i % BRANCH_COLORS.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
