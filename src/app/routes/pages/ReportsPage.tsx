import { useMemo, useState } from "react";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { useReports } from "@/features/reports/hooks/useReports";
import { ExpensePieChart } from "@/features/reports/components/ExpensesPieChart";
import { ProfitLineChart } from "@/features/reports/components/profitLineChart";
import { SalesByProductPieChart } from "@/features/reports/components/SalesByProductPieChart";
import { PayrollSummary } from "@/features/reports/components/PayrollSummary";
import { TrendingUp, Receipt, Percent, CalendarDays, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { HorizontalBarList } from "@/components/charts/HorizontalBarList";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import {
  BarChart, Bar,
} from "recharts";
import { formatCurrency, formatCurrencyCompact } from "@/utils/currency";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { startOfWeek } from "date-fns/startOfWeek";
import { endOfWeek } from "date-fns/endOfWeek";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useExpenses } from "@/features/expenses/hooks/useExpenses";
import { groupByWeekday } from "@/utils/groupByWeekday";
import type { RevenueByProduct } from "@/features/reports/types";
import type { Sale } from "@/features/sales/types";

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
                  <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${share}%` }} />
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
  const today = useMemo(() => new Date(), []);
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
  }, [preset, customFrom, todayStr, today]);

  const dateTo = useMemo(() => {
    switch (preset) {
      case "today": return todayStr;
      case "this-week": return format(endOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
      case "this-month": return format(endOfMonth(today), "yyyy-MM-dd");
      case "custom": return customTo;
    }
  }, [preset, customTo, todayStr, today]);

  const rangeLabel = useMemo(() => {
    if (dateFrom === dateTo) return dateFrom;
    return `${dateFrom} – ${dateTo}`;
  }, [dateFrom, dateTo]);

  const { categoryBreakdown, dailyProfit, filteredSales, totals, payroll, isLoading } = useReports(dateFrom, dateTo);
  const { data: allExpenses = [] } = useExpenses();
  const { data: products = [] } = useProducts();

  // KPI summary
  const avgDailyExpense = dailyProfit.length > 0
    ? dailyProfit.reduce((s, d) => s + d.expenses, 0) / dailyProfit.length
    : 0;
  const totalPayrollPaid = payroll.reduce((s, p) => s + p.grossPay, 0);

  // Employee cost chart data
  const employeeCostData = useMemo(() => {
    return payroll
      .filter((p) => p.hoursWorked > 0)
      .sort((a, b) => b.grossPay - a.grossPay)
      .map((p) => ({
        label: p.name,
        value: p.grossPay,
        color: "#E67E22",
      }));
  }, [payroll]);

  // Expense stacked area data by category
  const expenseStackedData = useMemo(() => {
    const categories = categoryBreakdown.map((c) => c.category);
    return dailyProfit.map((d) => {
      const dayExpenses = allExpenses.filter((e) => e.date === d.date);
      const row: Record<string, string | number> = { label: d.label };
      for (const cat of categories) {
        row[cat] = dayExpenses
          .filter((e) => e.category === cat)
          .reduce((sum, e) => sum + e.amount, 0);
      }
      return row;
    });
  }, [dailyProfit, allExpenses, categoryBreakdown]);

  // Day-of-week expense pattern
  const weekdayData = useMemo(() => {
    const records = allExpenses
      .filter((e) => e.date >= dateFrom && e.date <= dateTo)
      .map((e) => ({ date: e.date, amount: e.amount }));
    return groupByWeekday(records);
  }, [allExpenses, dateFrom, dateTo]);

  // Product leaderboard
  const productLeaderboard = useMemo(() => {
    const map = new Map<string, { revenue: number; quantity: number }>();
    filteredSales.forEach((s) => {
      const cur = map.get(s.productId) ?? { revenue: 0, quantity: 0 };
      cur.revenue += s.amount;
      cur.quantity += s.quantitySold;
      map.set(s.productId, cur);
    });
    const productMap = new Map(products.map((p) => [p.id, p.name]));
    return Array.from(map.entries())
      .map(([id, data]) => ({
        label: productMap.get(id) ?? "Unknown",
        value: data.revenue,
        quantity: data.quantity,
        color: "#F1C40F",
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredSales, products]);

  function handlePreset(p: Preset) {
    setPreset(p);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-char-900 md:text-xl">Reports</h2>
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
            <Button variant="outline" size="sm" onClick={() => setPreset("custom")}>Custom range</Button>
          )}
        </div>
      </div>

      {/* KPI summary strip */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <KpiPill label="Total sales" value={formatCurrency(totals.totalSales)} icon={TrendingUp} tone="accent" />
          <KpiPill label="Total expenses" value={formatCurrency(totals.totalExpenses)} icon={Receipt} tone="secondary" />
          <KpiPill label="Net margin" value={`${totals.totalSales > 0 ? (((totals.totalSales - totals.totalExpenses) / totals.totalSales) * 100).toFixed(1) : 0}%`} icon={Percent} tone="primary" />
          <KpiPill label="Avg. daily expense" value={formatCurrency(avgDailyExpense)} icon={CalendarDays} tone="danger" />
          <KpiPill label="Total payroll" value={formatCurrency(totalPayrollPaid)} icon={Wallet} tone="success" />
        </div>
      )}

      <Tabs defaultValue="overview">
        <div className="border-b border-line px-1">
          <TabsList className="mb-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <div className="space-y-4">
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
            {isLoading ? <Skeleton className="h-64 w-full" /> : <ProfitLineChart data={dailyProfit} />}
          </div>
        </TabsContent>

        <TabsContent value="expenses">
          <div className="space-y-4">
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Expense trend by category</CardTitle>
                    <CardDescription>Stacked area over time</CardDescription>
                  </div>
                </CardHeader>
                {categoryBreakdown.length === 0 ? (
                  <p className="py-10 text-center text-sm text-ink-faint">No expenses yet.</p>
                ) : (
                  <div className="h-72 -mx-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={expenseStackedData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }} axisLine={{ stroke: "var(--color-line)" }} tickLine={false} interval="preserveStartEnd" minTickGap={24} />
                        <YAxis tickFormatter={(v) => formatCurrencyCompact(v)} tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }} axisLine={false} tickLine={false} width={68} />
                        <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} contentStyle={{ borderRadius: 12, border: "1px solid var(--color-line)", fontSize: 13 }} />
                        <Legend verticalAlign="top" height={32} iconType="circle" iconSize={8} formatter={(value) => <span className="text-[10px] text-ink-soft">{value}</span>} />
                        {categoryBreakdown.map((cat) => (
                          <Area key={cat.category} type="monotone" dataKey={cat.category} name={cat.category} stackId="1" stroke={cat.color} fill={cat.color} fillOpacity={0.3} dot={false} />
                        ))}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>
            )}

            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Average expense by day of week</CardTitle>
                    <CardDescription>Which days cost the most</CardDescription>
                  </div>
                </CardHeader>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weekdayData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }} axisLine={{ stroke: "var(--color-line)" }} tickLine={false} />
                      <YAxis tickFormatter={(v) => formatCurrencyCompact(v)} tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }} axisLine={false} tickLine={false} width={68} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} contentStyle={{ borderRadius: 12, border: "1px solid var(--color-line)", fontSize: 13 }} />
                      <Bar dataKey="average" name="Avg. expense" fill="#C0392B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sales">
          <div className="space-y-4">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : (
              <>
                <SalesByProductPieChart sales={filteredSales} />
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Product leaderboard</CardTitle>
                    <CardDescription>Ranked by revenue</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {productLeaderboard.length === 0 ? (
                      <p className="py-6 text-center text-sm text-ink-faint">No sales data yet.</p>
                    ) : (
                      <HorizontalBarList
                        items={productLeaderboard}
                        formatValue={(v) => formatCurrency(v)}
                      />
                    )}
                  </CardContent>
                </Card>
                <RevenueByProductCard sales={filteredSales} />
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="payroll">
          <div className="space-y-4">
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <div>
                      <CardTitle>Employee cost comparison</CardTitle>
                      <CardDescription>Gross pay for the selected period</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {employeeCostData.length === 0 ? (
                      <p className="py-6 text-center text-sm text-ink-faint">No payroll data for this period.</p>
                    ) : (
                      <HorizontalBarList items={employeeCostData} formatValue={(v) => formatCurrency(v)} />
                    )}
                  </CardContent>
                </Card>
                <PayrollSummary />
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KpiPill({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "secondary" | "accent" | "success" | "danger";
}) {
  const toneClasses: Record<typeof tone, string> = {
    primary: "bg-primary/10 text-primary-dark",
    secondary: "bg-secondary/10 text-secondary-dark",
    accent: "bg-accent/20 text-accent-dark",
    success: "bg-success-bg text-success",
    danger: "bg-danger-bg text-danger",
  };

  return (
    <div className="flex items-start justify-between rounded-xl border border-line bg-surface px-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium uppercase tracking-wide text-ink-faint">{label}</p>
        <p className="stamp mt-0.5 text-lg font-semibold text-ink">{value}</p>
      </div>
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
        <Icon className="h-4 w-4" />
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
