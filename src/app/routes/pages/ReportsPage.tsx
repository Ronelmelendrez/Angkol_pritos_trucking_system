import { ErrorBoundary } from "@/components/layout/ErrorBoundary"
import { useReports } from "@/features/reports/hooks/useReports"
import { ExpensePieChart } from "@/features/reports/components/ExpensesPieChart"
import { ProfitLineChart } from "@/features/reports/components/profitLineChart"
import { PayrollSummary } from "@/features/reports/components/PayrollSummary"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Skeleton } from "@/components/ui/Skeleton"
import { formatCurrency } from "@/utils/currency"
import { useSales } from "@/features/sales/hooks/useSales"
import { useExpenses } from "@/features/expenses/hooks/useExpenses"

function BatchPerformance() {
  const { data: sales = [] } = useSales();
  const { data: expenses = [] } = useExpenses();

  const salesByExpense = new Map<string, number>();
  for (const sale of sales) {
    if (!sale.expenseId) continue;
    salesByExpense.set(sale.expenseId, (salesByExpense.get(sale.expenseId) ?? 0) + sale.amount);
  }

  const batches = expenses
    .map((exp) => {
      const recovered = salesByExpense.get(exp.id) ?? 0;
      return { ...exp, recovered, margin: exp.amount > 0 ? (recovered - exp.amount) / exp.amount : 0 };
    })
    .filter((b) => b.recovered > 0)
    .sort((a, b) => b.margin - a.margin);

  if (batches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Batch performance</CardTitle>
          <CardDescription>No sales linked to expenses yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Batch performance</CardTitle>
        <CardDescription>Best & worst performing batches by margin</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {batches.slice(0, 5).map((b) => (
          <div key={b.id} className="flex items-center justify-between text-sm">
            <div className="min-w-0 flex-1 truncate">
              <span className="text-ink">{b.description}</span>
              <span className="ml-2 text-xs text-ink-faint">
                {formatCurrency(b.recovered)} / {formatCurrency(b.amount)}
              </span>
            </div>
            <span className={`shrink-0 font-semibold ${b.margin >= 0 ? "text-success" : "text-danger"}`}>
              {(b.margin * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ReportsContent() {
  const { categoryBreakdown, dailyProfit, payroll, isLoading } = useReports(30);

  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-display text-lg font-semibold text-char-900 md:text-xl">
        Reports
      </h2>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <ExpensePieChart data={categoryBreakdown} />
          <ProfitLineChart data={dailyProfit} />
        </div>
      )}

      <BatchPerformance />

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <PayrollSummary rows={payroll} />
      )}
    </div>
  );
}

export function ReportsPage() {
  return (
    <ErrorBoundary section="Reports">
      <ReportsContent />
    </ErrorBoundary>
  );
}
