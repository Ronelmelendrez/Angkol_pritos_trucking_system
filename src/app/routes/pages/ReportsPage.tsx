import { useMemo } from "react";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary"
import { useReports } from "@/features/reports/hooks/useReports"
import { ExpensePieChart } from "@/features/reports/components/ExpensesPieChart"
import { ProfitLineChart } from "@/features/reports/components/profitLineChart"
import { PayrollSummary } from "@/features/reports/components/PayrollSummary"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Skeleton } from "@/components/ui/Skeleton"
import { formatCurrency } from "@/utils/currency"
import { useSales } from "@/features/sales/hooks/useSales"
import { useProducts } from "@/features/products/hooks/useProducts"
import type { RevenueByProduct } from "@/features/reports/types"

function RevenueByProductCard() {
  const { data: sales = [] } = useSales();
  const { data: products = [] } = useProducts();

  const revenue = useMemo<RevenueByProduct[]>(() => {
    const map = new Map<string, { total: number; quantity: number }>();
    for (const sale of sales) {
      const cur = map.get(sale.productId) ?? { total: 0, quantity: 0 };
      cur.total += sale.amount;
      cur.quantity += sale.quantitySold;
      map.set(sale.productId, cur);
    }
    const productMap = new Map(products.map((p) => [p.id, p]));
    return Array.from(map.entries())
      .map(([productId, { total, quantity }]) => ({
        productId,
        productName: productMap.get(productId)?.name ?? "Unknown",
        total,
        quantity,
      }))
      .sort((a, b) => b.total - a.total);
  }, [sales, products]);

  if (revenue.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Revenue by product</CardTitle>
          <CardDescription>No sales data yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const grandTotal = revenue.reduce((s, r) => s + r.total, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Revenue by product</CardTitle>
        <CardDescription>{formatCurrency(grandTotal)} total</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {revenue.map((r) => {
          const share = grandTotal > 0 ? (r.total / grandTotal) * 100 : 0;
          return (
            <div key={r.productId} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-ink">{r.productName}</span>
                <span className="font-semibold text-ink">{formatCurrency(r.total)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-ink-faint">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/5">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${share}%` }}
                  />
                </div>
                <span className="shrink-0 w-10 text-right">{share.toFixed(0)}%</span>
              </div>
              <p className="text-xs text-ink-faint">{r.quantity} units sold</p>
            </div>
          );
        })}
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

      <div className="grid gap-4 md:grid-cols-2">
        <RevenueByProductCard />
        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <PayrollSummary rows={payroll} />
        )}
      </div>
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
