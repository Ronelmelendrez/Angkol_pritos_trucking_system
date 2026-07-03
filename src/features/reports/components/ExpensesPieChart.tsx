import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/utils/currency";
import type { CategoryBreakdown } from "../types";

export function ExpensePieChart({ data }: { data: CategoryBreakdown[] }) {
  const total = data.reduce((sum, d) => sum + d.total, 0);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Expense breakdown</CardTitle>
          <CardDescription>By category, all-time</CardDescription>
        </div>
      </CardHeader>
      {data.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-faint">No expenses yet.</p>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="total"
                nameKey="category"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
              >
                {data.map((entry) => (
                  <Cell key={entry.category} fill={entry.color} stroke="var(--color-surface)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--color-line)",
                  fontSize: 13,
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={48}
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-xs text-ink-soft">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
      {total > 0 && (
        <p className="mt-1 text-center text-sm text-ink-soft">
          Total: <span className="font-semibold text-ink">{formatCurrency(total)}</span>
        </p>
      )}
    </Card>
  );
}