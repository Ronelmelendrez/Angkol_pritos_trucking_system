import { useMemo, useState } from "react";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary"
import { useReports } from "@/features/reports/hooks/useReports"
import { ExpensePieChart } from "@/features/reports/components/ExpensesPieChart"
import { ProfitLineChart } from "@/features/reports/components/profitLineChart"
import { SalesByProductPieChart } from "@/features/reports/components/SalesByProductPieChart"
import { PayrollSummary } from "@/features/reports/components/PayrollSummary"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Skeleton } from "@/components/ui/Skeleton"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Label } from "@/components/ui/Label"
import { formatCurrency } from "@/utils/currency"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { startOfWeek } from "date-fns/startOfWeek"
import { endOfWeek } from "date-fns/endOfWeek"
import { useProducts } from "@/features/products/hooks/useProducts"
import type { RevenueByProduct } from "@/features/reports/types"
import type { Sale } from "@/features/sales/types"

function RevenueByProductCard({ sales }: { sales: Sale[] }) {
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

type Preset = "today" | "this-week" | "this-month" | "custom";

function ReportsContent() {
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");

  const [preset, setPreset] = useState<Preset>("this-month");
  const [customFrom, setCustomFrom] = useState(todayStr);
  const [customTo, setCustomTo] = useState(todayStr);

  const dateFrom = useMemo(() => {
    switch (preset) {
      case "today": return todayStr;
      case "this-week": return format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
      case "this-month": return format(startOfMonth(today), "yyyy-MM-dd");
      case "custom": return customFrom;
    }
  }, [preset, customFrom, todayStr]);

  const dateTo = useMemo(() => {
    switch (preset) {
      case "today": return todayStr;
      case "this-week": return format(endOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
      case "this-month": return format(endOfMonth(today), "yyyy-MM-dd");
      case "custom": return customTo;
    }
  }, [preset, customTo, todayStr]);

  const rangeLabel = useMemo(() => {
    if (dateFrom === dateTo) return dateFrom;
    return `${dateFrom} \u2013 ${dateTo}`;
  }, [dateFrom, dateTo]);

  const { categoryBreakdown, dailyProfit, filteredSales, isLoading } = useReports(dateFrom, dateTo);

  function handlePreset(p: Preset) {
    setPreset(p);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-char-900 md:text-xl">
            Reports
          </h2>
          <p className="text-xs text-ink-faint">{rangeLabel}</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex gap-1">
            {(["today", "this-week", "this-month"] as const).map((p) => (
              <Button key={p} variant={preset === p ? "default" : "outline"} size="sm" onClick={() => handlePreset(p)}>
                {p === "today" ? "Today" : p === "this-week" ? "This week" : "This month"}
              </Button>
            ))}
          </div>
          {preset === "custom" ? (
            <div className="flex items-end gap-2">
              <div>
                <Label className="text-xs text-ink-faint">From</Label>
                <Input type="date" value={customFrom} onChange={(e) => { setPreset("custom"); setCustomFrom(e.target.value); }} className="w-36" />
              </div>
              <div>
                <Label className="text-xs text-ink-faint">To</Label>
                <Input type="date" value={customTo} onChange={(e) => { setPreset("custom"); setCustomTo(e.target.value); }} className="w-36" />
              </div>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setPreset("custom")}>
              Custom range
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <ExpensePieChart data={categoryBreakdown} />
          <SalesByProductPieChart sales={filteredSales} />
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <ProfitLineChart data={dailyProfit} />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <RevenueByProductCard sales={filteredSales} />
        <PayrollSummary />
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
