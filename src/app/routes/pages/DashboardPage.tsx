import { useMemo, useState } from "react";
import { TrendingUp, TrendingDown, Users, Receipt, ArrowRight, Wallet, PiggyBank, Medal, CircleDollarSign, CalendarClock } from "lucide-react";
import { Link } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { subDays, format as formatDateFns } from "date-fns";
import { useExpenses } from "@/features/expenses/hooks/useExpenses";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import { useAttendance } from "@/features/attendance/hooks/useAttendance";
import { useSales } from "@/features/sales/hooks/useSales";
import { useAdvances } from "@/features/advances/hooks/useAdvances";
import { useLoans } from "@/features/loans/hooks/useLoans";
import { usePayRuleSettings } from "@/features/settings/hooks/usePayRuleSettings";
import { useReports } from "@/features/reports/hooks/useReports";
import { Sparkline } from "@/components/charts/Sparkline";
import { TrendBadge } from "@/components/charts/TrendBadge";
import { CalendarHeatmap } from "@/components/charts/CalendarHeatmap";
import { comparePeriods } from "@/utils/periodComparison";
import { formatCurrency, formatCurrencyCompact } from "@/utils/currency";
import { formatDate, isDateToday } from "@/utils/date";
import { CATEGORY_COLORS } from "@/lib/constants";

export function DashboardPage() {
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const { data: attendance = [], isLoading: attendanceLoading } = useAttendance();
  const { data: sales = [], isLoading: salesLoading } = useSales();
  const { data: advances = [] } = useAdvances();
  const { data: loans = [] } = useLoans();
  const { data: settings } = usePayRuleSettings();
  const dateTo = formatDateFns(new Date(), "yyyy-MM-dd");
  const dateFrom = formatDateFns(subDays(new Date(), 29), "yyyy-MM-dd");
  const { dailyProfit, isLoading: reportsLoading } = useReports(dateFrom, dateTo);

  const yesterday = formatDateFns(subDays(new Date(), 1), "yyyy-MM-dd");

  const todaysSales = sales.filter((s) => isDateToday(s.date));
  const todaysSalesTotal = todaysSales.reduce((sum, s) => sum + s.amount, 0);
  const todaysExpenses = expenses.filter((e) => isDateToday(e.date));
  const totalToday = todaysExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfitToday = todaysSalesTotal - totalToday;
  const activeEmployees = employees.filter((e) => e.isActive);
  const clockedInNow = attendance.filter((a) => isDateToday(a.date) && !a.clockOut);
  const recentExpenses = [...expenses]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 5);

  // Yesterday comparison
  const yesterdaysSales = sales.filter((s) => s.date === yesterday);
  const yesterdaysSalesTotal = yesterdaysSales.reduce((sum, s) => sum + s.amount, 0);
  const yesterdaysExpenses = expenses.filter((e) => e.date === yesterday);
  const yesterdaysExpensesTotal = yesterdaysExpenses.reduce((sum, e) => sum + e.amount, 0);
  const yesterdaysProfit = yesterdaysSalesTotal - yesterdaysExpensesTotal;

  const salesComparison = comparePeriods(todaysSalesTotal, yesterdaysSalesTotal);
  const expensesComparison = comparePeriods(totalToday, yesterdaysExpensesTotal);
  const profitComparison = comparePeriods(netProfitToday, yesterdaysProfit);

  // 7-day sparkline data
  const last7 = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      const key = formatDateFns(d, "yyyy-MM-dd");
      return key;
    });
    return {
      sales: days.map((d) => sales.filter((s) => s.date === d).reduce((sum, s) => sum + s.amount, 0)),
      expenses: days.map((d) => expenses.filter((e) => e.date === d).reduce((sum, e) => sum + e.amount, 0)),
      profit: days.map((d) => {
        const s = sales.filter((sa) => sa.date === d).reduce((sum, sa) => sum + sa.amount, 0);
        const e = expenses.filter((ex) => ex.date === d).reduce((sum, ex) => sum + ex.amount, 0);
        return s - e;
      }),
    };
  }, [sales, expenses]);

  // Busiest days heatmap (last 60 days)
  const [heatmapMode, setHeatmapMode] = useState<"expenses" | "sales">("expenses");

  const expenseHeatmap = useMemo(() => {
    const map = new Map<string, number>();
    const start = subDays(new Date(), 59);
    expenses
      .filter((e) => e.date >= formatDateFns(start, "yyyy-MM-dd"))
      .forEach((e) => map.set(e.date, (map.get(e.date) ?? 0) + e.amount));
    return Array.from(map.entries()).map(([date, value]) => ({ date, value }));
  }, [expenses]);

  const salesHeatmap = useMemo(() => {
    const map = new Map<string, number>();
    const start = subDays(new Date(), 59);
    sales
      .filter((s) => s.date >= formatDateFns(start, "yyyy-MM-dd"))
      .forEach((s) => map.set(s.date, (map.get(s.date) ?? 0) + s.amount));
    return Array.from(map.entries()).map(([date, value]) => ({ date, value }));
  }, [sales]);

  // Cash flow health
  const pendingAdvances = advances
    .filter((a) => a.status === "pending")
    .reduce((sum, a) => sum + a.amount, 0);
  const activeLoanBalance = loans
    .filter((l) => l.status === "active")
    .reduce((sum, l) => sum + l.remainingBalance, 0);
  const totalOutstanding = pendingAdvances + activeLoanBalance;

  // Payroll due soon
  const payrollDue = useMemo(() => {
    if (!settings?.paydayRules?.length) return null;
    const today = new Date();
    let nearest: { date: Date; daysAway: number; freq: string } | null = null;
    for (const rule of settings.paydayRules) {
      // Simple: check next 14 days for a matching weekday
      for (let i = 0; i <= 14; i++) {
        const d = subDays(today, -i);
        if (rule.fixedWeekday != null && d.getDay() === rule.fixedWeekday) {
          const daysAway = Math.round((d.getTime() - today.getTime()) / 86400000);
          if (!nearest || daysAway < nearest.daysAway) {
            nearest = { date: d, daysAway, freq: rule.frequency };
          }
          break;
        }
      }
    }
    return nearest;
  }, [settings]);

  const crewRanking = useMemo(() => {
    const thirtyDaysAgo = formatDateFns(subDays(new Date(), 29), "yyyy-MM-dd");
    const today = formatDateFns(new Date(), "yyyy-MM-dd");

    return activeEmployees
      .map((emp) => {
        const records = attendance.filter(
          (a) => a.employeeId === emp.id && a.date >= thirtyDaysAgo && a.date <= today,
        );
        const present = records.filter(
          (a) => a.status === "present" || a.clockIn !== null,
        ).length;
        const absent = records.filter((a) => a.status === "absent").length;
        const total = present + absent;
        const rate = total > 0 ? (present / total) * 100 : 0;
        return { ...emp, present, absent, total, rate };
      })
      .sort((a, b) => b.rate - a.rate || b.present - a.present);
  }, [activeEmployees, attendance]);

  const isLoading = expensesLoading || employeesLoading || attendanceLoading || salesLoading;

  const periodSales = dailyProfit.reduce((sum, d) => sum + d.sales, 0);
  const periodExpenses = dailyProfit.reduce((sum, d) => sum + d.expenses, 0);
  const periodProfit = periodSales - periodExpenses;
  const margin = periodSales > 0 ? (periodProfit / periodSales) * 100 : 0;

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Today's sales"
          value={formatCurrency(todaysSalesTotal)}
          icon={TrendingUp}
          tone="accent"
          hint={`${todaysSales.length} transaction${todaysSales.length === 1 ? "" : "s"}`}
          trend={salesComparison}
          sparkline={last7.sales}
          sparkColor="#F1C40F"
          isLoading={isLoading}
        />
        <StatCard
          label="Today's expenses"
          value={formatCurrency(totalToday)}
          icon={Receipt}
          tone="secondary"
          hint={`${todaysExpenses.length} transactions`}
          trend={expensesComparison}
          sparkline={last7.expenses}
          sparkColor="#C0392B"
          isLoading={isLoading}
        />
        <StatCard
          label="Net profit today"
          value={formatCurrency(netProfitToday)}
          icon={netProfitToday >= 0 ? TrendingUp : TrendingDown}
          tone={netProfitToday >= 0 ? "success" : "danger"}
          hint="Sales minus expenses"
          trend={profitComparison}
          sparkline={last7.profit}
          sparkColor="#E67E22"
          isLoading={isLoading}
        />
        <StatCard
          label="On shift now"
          value={`${clockedInNow.length} / ${activeEmployees.length}`}
          icon={Users}
          tone="primary"
          hint="Active employees"
          isLoading={isLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Sales vs expenses</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </div>
        </CardHeader>

        {reportsLoading ? (
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryPill icon={PiggyBank} label="Total sales" value={formatCurrency(periodSales)} tone="accent" />
            <SummaryPill icon={Receipt} label="Total expenses" value={formatCurrency(periodExpenses)} tone="secondary" />
            <SummaryPill icon={Wallet} label="Net profit" value={formatCurrency(periodProfit)} tone={periodProfit >= 0 ? "success" : "danger"} />
            <SummaryPill icon={periodProfit >= 0 ? TrendingUp : TrendingDown} label="Margin" value={`${margin.toFixed(1)}%`} tone={margin >= 0 ? "primary" : "danger"} />
          </div>
        )}

        {reportsLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : dailyProfit.every((d) => d.sales === 0) ? (
          <p className="py-10 text-center text-sm text-ink-faint">
            No sales logged yet — log your first sale to see the trend appear.
          </p>
        ) : (
          <div className="h-72 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyProfit} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F1C40F" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#F1C40F" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C0392B" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#C0392B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E67E22" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#E67E22" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }} axisLine={{ stroke: "var(--color-line)" }} tickLine={false} interval="preserveStartEnd" minTickGap={24} />
                <YAxis tickFormatter={(v) => formatCurrencyCompact(v)} tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }} axisLine={false} tickLine={false} width={68} />
                <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} labelFormatter={(label) => label} contentStyle={{ borderRadius: 12, border: "1px solid var(--color-line)", boxShadow: "0 6px 20px rgba(62,39,35,0.12)", fontSize: 13 }} />
                <Legend verticalAlign="top" height={32} iconType="circle" iconSize={8} formatter={(value) => <span className="text-xs text-ink-soft">{value}</span>} />
                <Area type="monotone" dataKey="sales" name="Sales" stroke="#F1C40F" strokeWidth={2.5} fill="url(#salesGradient)" dot={false} activeDot={{ r: 4 }} />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#C0392B" strokeWidth={2.5} fill="url(#expensesGradient)" dot={false} activeDot={{ r: 4 }} />
                <Area type="monotone" dataKey="profit" name="Profit" stroke="#E67E22" strokeWidth={2.5} fill="url(#profitGradient)" dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* New row: Busiest days + Cash flow + Payroll due */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="ticket">
          <CardHeader>
            <div>
              <CardTitle>Busiest days</CardTitle>
              <CardDescription>
                {heatmapMode === "expenses" ? "Expense" : "Sales"} volume by day
              </CardDescription>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setHeatmapMode("expenses")}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  heatmapMode === "expenses"
                    ? "bg-secondary/10 text-secondary-dark"
                    : "text-ink-faint hover:bg-ink/5"
                }`}
              >
                Expenses
              </button>
              <button
                onClick={() => setHeatmapMode("sales")}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  heatmapMode === "sales"
                    ? "bg-accent/20 text-accent-dark"
                    : "text-ink-faint hover:bg-ink/5"
                }`}
              >
                Sales
              </button>
            </div>
          </CardHeader>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <CalendarHeatmap
              data={heatmapMode === "expenses" ? expenseHeatmap : salesHeatmap}
              color={heatmapMode === "expenses" ? "#C0392B" : "#F1C40F"}
            />
          )}
        </Card>

        <Card className="ticket">
          <CardHeader>
            <div>
              <CardTitle>Cash flow health</CardTitle>
              <CardDescription>Outstanding balances</CardDescription>
            </div>
          </CardHeader>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-ink/3 px-4 py-3">
                <span className="flex items-center gap-2 text-sm text-ink-soft">
                  <CircleDollarSign className="h-4 w-4" /> Pending advances
                </span>
                <span className="text-sm font-semibold text-ink">{formatCurrency(pendingAdvances)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-ink/3 px-4 py-3">
                <span className="flex items-center gap-2 text-sm text-ink-soft">
                  <Wallet className="h-4 w-4" /> Active loan balance
                </span>
                <span className="text-sm font-semibold text-ink">{formatCurrency(activeLoanBalance)}</span>
              </div>
              <div className="border-t border-line pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ink">Total outstanding</span>
                  <span className="text-lg font-bold text-ink">{formatCurrency(totalOutstanding)}</span>
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card className="ticket">
          <CardHeader>
            <div>
              <CardTitle>Payroll due soon</CardTitle>
              <CardDescription>Next scheduled payday</CardDescription>
            </div>
          </CardHeader>
          {isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : payrollDue ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg bg-ink/3 px-4 py-3">
                <CalendarClock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-ink">
                    {formatDateFns(payrollDue.date, "EEEE, MMM d")}
                  </p>
                  <p className="text-xs text-ink-faint">
                    {payrollDue.daysAway === 0
                      ? "Today"
                      : payrollDue.daysAway === 1
                        ? "Tomorrow"
                        : `In ${payrollDue.daysAway} days`}
                    {" · "}
                    <span className="capitalize">{payrollDue.freq.replace("_", " ")}</span> cycle
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-ink-faint">No payday rules configured.</p>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Recent expenses</CardTitle>
              <CardDescription>Latest transactions logged</CardDescription>
            </div>
            <Link to="/dashboard/expenses" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recentExpenses.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-faint">No expenses logged yet.</p>
          ) : (
            <div className="divide-y divide-line">
              {recentExpenses.map((exp) => (
                <div key={exp.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{exp.description}</p>
                    <p className="text-xs text-ink-faint">{formatDate(exp.date)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge className="border-0" style={{ backgroundColor: `${CATEGORY_COLORS[exp.category]}1a`, color: CATEGORY_COLORS[exp.category] }}>
                      {exp.category}
                    </Badge>
                    <span className="text-sm font-semibold text-ink">{formatCurrency(exp.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Crew ranking</CardTitle>
              <CardDescription>Attendance rate (last 30 days)</CardDescription>
            </div>
            <Link to="/dashboard/employees" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : crewRanking.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-faint">No active employees yet.</p>
          ) : (
            <div className="space-y-3">
              {crewRanking.slice(0, 5).map((emp, idx) => (
                <div key={emp.id} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink/5 text-[10px] font-bold text-ink-soft">
                    {idx + 1}
                  </span>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: emp.avatarColor }}>
                    {emp.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-ink">{emp.name}</span>
                    <span className="text-[11px] text-ink-faint">
                      {emp.present} present · {emp.absent} absent
                    </span>
                  </div>
                  {idx === 0 && emp.total > 0 ? (
                    <Badge variant="default" className="gap-1">
                      <Medal className="h-3 w-3" /> {emp.rate.toFixed(0)}%
                    </Badge>
                  ) : (
                    <Badge variant="neutral">{emp.rate.toFixed(0)}%</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  hint,
  trend,
  sparkline,
  sparkColor,
  isLoading,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "secondary" | "accent" | "success" | "danger";
  hint: string;
  trend?: { current: number; previous: number; percentChange: number };
  sparkline?: number[];
  sparkColor?: string;
  isLoading: boolean;
}) {
  const toneClasses: Record<typeof tone, string> = {
    primary: "bg-primary/10 text-primary-dark",
    secondary: "bg-secondary/10 text-secondary-dark",
    accent: "bg-accent/20 text-accent-dark",
    success: "bg-success-bg text-success",
    danger: "bg-danger-bg text-danger",
  };

  return (
    <Card className="ticket-hover ticket-perf">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">{label}</p>
          {isLoading ? (
            <Skeleton className="mt-2 h-7 w-24" />
          ) : (
            <div className="mt-1 flex items-baseline gap-2">
              <p className="stamp text-2xl font-semibold text-ink">{value}</p>
              {trend && <TrendBadge current={trend.current} previous={trend.previous} />}
            </div>
          )}
          <p className="mt-1 text-xs text-ink-faint">{hint}</p>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {sparkline && sparkline.length > 0 && (
        <div className="mt-2 -mx-1">
          <Sparkline data={sparkline} color={sparkColor} height={32} />
        </div>
      )}
    </Card>
  );
}

function SummaryPill({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
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
    <div className="flex items-center gap-2.5 rounded-xl border border-line bg-bg/60 px-3 py-2.5">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-[11px] text-ink-faint">{label}</p>
        <p className="truncate text-sm font-bold text-ink">{value}</p>
      </div>
    </div>
  );
}
