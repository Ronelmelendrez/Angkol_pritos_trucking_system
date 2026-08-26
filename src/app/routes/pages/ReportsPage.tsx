import { useMemo, useState } from "react";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { useReports } from "@/features/reports/hooks/useReports";
import { ExpensePieChart } from "@/features/reports/components/ExpensesPieChart";
import { ProfitLineChart } from "@/features/reports/components/profitLineChart";
import { SalesByProductPieChart } from "@/features/reports/components/SalesByProductPieChart";
import { PayrollSummary } from "@/features/reports/components/PayrollSummary";
import { DailyCashReport } from "@/features/cash/components/DailyCashReport";
import { TrendingUp, Receipt, Percent, CalendarDays, Wallet, Building2, Trophy, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Input } from "@/components/ui/Input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { DatePresets, type DatePreset } from "@/components/ui/DatePresets";
import { HorizontalBarList } from "@/components/charts/HorizontalBarList";
import { BranchSalesLineChart } from "@/features/reports/components/BranchSalesLineChart";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import {
  BarChart, Bar,
} from "recharts";
import { formatCurrency, formatCurrencyCompact } from "@/utils/currency";
import { useChartLabelCount, chartXInterval } from "@/utils/chartTicks";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { startOfWeek } from "date-fns/startOfWeek";
import { endOfWeek } from "date-fns/endOfWeek";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useExpenses } from "@/features/expenses/hooks/useExpenses";
import { useBranchSalesSummary } from "@/features/sales/hooks/useBranchSales";
import { InsightsPanel, useInsights } from "@/features/insights";
import { groupByWeekday } from "@/utils/groupByWeekday";
import { cn } from "@/utils/cn";
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

function ReportsContent() {
  const today = useMemo(() => new Date(), []);
  const todayStr = format(today, "yyyy-MM-dd");

  const [preset, setPreset] = useState<DatePreset>("this-month");
  const [customFrom, setCustomFrom] = useState(todayStr);
  const [customTo, setCustomTo] = useState(todayStr);
  const [cashDate, setCashDate] = useState(todayStr);

  const labelCount = useChartLabelCount();

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
  const { insights, isLoading: insightsLoading } = useInsights(dateFrom, dateTo);
  const { data: branchSales = [], isLoading: branchLoading } = useBranchSalesSummary(dateFrom, dateTo);

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

  function handlePreset(p: DatePreset) {
    setPreset(p);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="stamp text-lg font-semibold text-ink md:text-xl">Reports</h2>
          <p className="text-xs text-ink-faint">{rangeLabel}</p>
        </div>
        <DatePresets
          value={preset}
          onChange={handlePreset}
          customFrom={customFrom}
          customTo={customTo}
          onCustomFromChange={setCustomFrom}
          onCustomToChange={setCustomTo}
        />
      </div>

      {/* KPI summary strip */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <KpiPill label="Total sales" value={formatCurrency(totals.totalSales)} icon={TrendingUp} tone="accent" />
          <KpiPill label="Total expenses" value={formatCurrency(totals.totalExpenses)} icon={Receipt} tone="secondary" />
          <KpiPill label="Net margin" value={`${totals.totalSales > 0 ? (((totals.totalSales - totals.totalExpenses) / totals.totalSales) * 100).toFixed(1) : 0}%`} icon={Percent} tone="primary" />
          <KpiPill label="Avg. daily expense" value={formatCurrency(avgDailyExpense)} icon={CalendarDays} tone="danger" />
          <KpiPill label="Total payroll" value={formatCurrency(totalPayrollPaid)} icon={Wallet} tone="success" />
        </div>
      )}

      <Tabs defaultValue="overview">
        <div className="overflow-x-auto border-b border-line px-1">
          <TabsList className="mb-2 w-max">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="cash">Daily Cash</TabsTrigger>
            <TabsTrigger value="branches">Branches</TabsTrigger>
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

        <TabsContent value="insights">
          <InsightsPanel
            insights={insights}
            isLoading={insightsLoading}
            title="Key insights"
            description={`Auto-generated from ${rangeLabel}`}
          />
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
                      <AreaChart data={expenseStackedData} margin={{ left: 0, right: 12, top: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }}
                          axisLine={{ stroke: "var(--color-line)" }}
                          tickLine={false}
                          interval={chartXInterval(expenseStackedData.length, labelCount)}
                          padding={{ left: 12, right: 12 }}
                          tickMargin={8}
                        />
                        <YAxis tickFormatter={(v) => formatCurrencyCompact(v)} tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }} axisLine={false} tickLine={false} width={56} />
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
                      <BarChart data={weekdayData} margin={{ left: 0, right: 12, top: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }} axisLine={{ stroke: "var(--color-line)" }} tickLine={false} padding={{ left: 12, right: 12 }} tickMargin={8} />
                        <YAxis tickFormatter={(v) => formatCurrencyCompact(v)} tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }} axisLine={false} tickLine={false} width={56} />
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

        <TabsContent value="cash">
          <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink">Daily cash reconciliation</p>
                <p className="text-xs text-ink-faint">Opening + cash in − cash out vs. actual drawer count</p>
              </div>
              <div className="w-full max-w-52">
                <p className="mb-1 text-xs font-medium text-ink-soft">Report date</p>
                <Input type="date" value={cashDate} onChange={(e) => setCashDate(e.target.value)} />
              </div>
            </div>
            <DailyCashReport date={cashDate} />
          </div>
        </TabsContent>

        <TabsContent value="branches">
          <div className="space-y-4">
            {branchLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : branchSales.length === 0 ? (
              <Card>
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line py-14 text-center">
                  <Building2 className="mb-2 h-8 w-8 text-ink-faint" />
                  <p className="text-sm font-medium text-ink">No branch sales data</p>
                  <p className="text-xs text-ink-faint">Sales will appear here once recorded by branch.</p>
                </div>
              </Card>
            ) : (() => {
              const totalSales = branchSales.reduce((s, b) => s + b.totalSales, 0);
              const totalQty = branchSales.reduce((s, b) => s + b.totalQuantity, 0);
              const totalTxns = branchSales.reduce((s, b) => s + b.transactionCount, 0);
              const topBranch = branchSales[0];

              return (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border border-line bg-accent-subtle p-4 text-center">
                      <Building2 className="mx-auto h-5 w-5 text-primary" />
                      <p className="mt-1 text-xs text-ink-soft">Branches</p>
                      <p className="text-lg font-bold text-ink">{branchSales.length}</p>
                    </div>
                    <div className="rounded-lg border border-line bg-accent-subtle p-4 text-center">
                      <TrendingUp className="mx-auto h-5 w-5 text-primary" />
                      <p className="mt-1 text-xs text-ink-soft">Total Sales</p>
                      <p className="text-lg font-bold text-ink">{formatCurrency(totalSales)}</p>
                    </div>
                    <div className="rounded-lg border border-line bg-accent-subtle p-4 text-center">
                      <Receipt className="mx-auto h-5 w-5 text-primary" />
                      <p className="mt-1 text-xs text-ink-soft">Transactions</p>
                      <p className="text-lg font-bold text-ink">{totalTxns}</p>
                    </div>
                  </div>

                  {topBranch && (
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-primary">
                        <Trophy className="h-4 w-4" />
                        Top Performing Branch: <span className="font-bold">{topBranch.branchName}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-ink-soft">Sales</span>
                        <span className="font-bold text-primary">{formatCurrency(topBranch.totalSales)}</span>
                      </div>
                      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-ink/6">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${((topBranch.totalSales / totalSales) * 100).toFixed(0)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">Branch breakdown</CardTitle>
                      <CardDescription>{rangeLabel}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-medium text-ink-soft uppercase tracking-wider">
                          <div className="w-32">Branch</div>
                          <div className="w-24 text-right">Sales</div>
                          <div className="w-20 text-right">Qty</div>
                          <div className="w-20 text-right">Txns</div>
                          <div className="flex-1">Share</div>
                        </div>
                        {branchSales.map((branch, index) => (
                          <div
                            key={branch.branchId}
                            className={cn(
                              "flex items-center gap-2 text-sm",
                              index === 0 && "bg-primary/5 rounded-lg px-3 py-2",
                            )}
                          >
                            <span className="w-8 text-center">
                              {index === 0 && <Trophy className="mx-auto h-4 w-4 text-yellow-500" />}
                              {index === 1 && <Target className="mx-auto h-4 w-4 text-gray-400" />}
                              {index === 2 && <Target className="mx-auto h-4 w-4 text-amber-600" />}
                              {index > 2 && <span className="text-ink-faint">#{index + 1}</span>}
                            </span>
                            <div className="w-32 font-medium text-ink truncate">{branch.branchName}</div>
                            <div className="w-24 text-right font-medium text-primary">{formatCurrency(branch.totalSales)}</div>
                            <div className="w-20 text-right text-ink-soft">{branch.totalQuantity}</div>
                            <div className="w-20 text-right text-ink-soft">{branch.transactionCount}</div>
                            <div className="flex-1">
                              <div className="h-2 w-full overflow-hidden rounded-full bg-ink/6">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all",
                                    index === 0 ? "bg-primary" : "bg-ink/20",
                                  )}
                                  style={{ width: `${((branch.totalSales / totalSales) * 100).toFixed(1)}%` }}
                                />
                              </div>
                            </div>
                            <span className="w-12 text-right text-xs text-ink-soft">
                              {((branch.totalSales / totalSales) * 100).toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              );
            })()}
            <BranchSalesLineChart dateFrom={dateFrom} dateTo={dateTo} />
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
        <p className="stamp mt-0.5 truncate text-lg font-semibold text-ink">{value}</p>
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
