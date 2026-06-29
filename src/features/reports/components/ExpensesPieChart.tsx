import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useExpenseCategoryBreakdown } from "@/features/reports/hooks/useReports"
import { CATEGORY_COLORS } from "@/lib/constants"
import { formatPHP } from "@/utils/currency"

export function ExpensePieChart() {
  const { data: breakdown = [], isLoading } = useExpenseCategoryBreakdown()
  const total = breakdown.reduce((sum, b) => sum + b.total, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses by category</CardTitle>
        <p className="text-xs text-muted-foreground">This month</p>
      </CardHeader>
      <CardContent className="pb-5">
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : breakdown.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No expenses recorded this month yet.
          </p>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdown}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {breakdown.map((entry) => (
                    <Cell
                      key={entry.category}
                      fill={CATEGORY_COLORS[entry.category] ?? "#C8B8AE"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    formatPHP(typeof value === "number" ? value : Number(value) || 0),
                    String(name),
                  ]}
                  contentStyle={{
                    borderRadius: 8,
                    borderColor: "#E8D9C3",
                    fontSize: 13,
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                  formatter={(value: string) => value}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        {!isLoading && breakdown.length > 0 && (
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Total: <span className="font-figures font-semibold text-char-900">{formatPHP(total)}</span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}