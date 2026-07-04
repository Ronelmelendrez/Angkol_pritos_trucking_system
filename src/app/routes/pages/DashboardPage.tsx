import { TrendingUp, TrendingDown, Users, Receipt, ArrowRight, Wallet, PiggyBank } from "lucide-react";
import { Link } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useExpenses } from "@/features/expenses/hooks/useExpenses";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import { useAttendance } from "@/features/attendance/hooks/useAttendance";
import { useReports } from "@/features/reports/hooks/useReports";
import { formatCurrency, formatCurrencyCompact } from "@/utils/currency";
import { formatDate, isDateToday } from "@/utils/date";
import { CATEGORY_COLORS, DEFAULT_DAILY_SALES } from "@/lib/constants";

export function DashboardPage() {
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const { data: attendance = [], isLoading: attendanceLoading } = useAttendance();
  const { dailyProfit, isLoading: reportsLoading } = useReports(30);

  const todaysExpenses = expenses.filter((e) => isDateToday(e.date));
  const totalToday = todaysExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfitToday = DEFAULT_DAILY_SALES - totalToday;
  const activeEmployees = employees.filter((e) => e.isActive);
  const clockedInNow = attendance.filter((a) => isDateToday(a.date) && !a.clockOut);
  const recentExpenses = [...expenses]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 5);

  const isLoading = expensesLoading || employeesLoading || attendanceLoading;

  // 30-day rollups for the sales vs expenses summary strip
  const periodSales = dailyProfit.reduce((sum, d) => sum + d.sales, 0);
  const periodExpenses = dailyProfit.reduce((sum, d) => sum + d.expenses, 0);
  const periodProfit = periodSales - periodExpenses;
  const margin = periodSales > 0 ? (periodProfit / periodSales) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Today's sales"
          value={formatCurrency(DEFAULT_DAILY_SALES)}
          icon={TrendingUp}
          tone="accent"
          hint="Manual entry"
          isLoading={isLoading}
        />
        <StatCard
          label="Today's expenses"
          value={formatCurrency(totalToday)}
          icon={Receipt}
          tone="secondary"
          hint={`${todaysExpenses.length} transactions`}
          isLoading={isLoading}
        />
        <StatCard
          label="Net profit today"
          value={formatCurrency(netProfitToday)}
          icon={netProfitToday >= 0 ? TrendingUp : TrendingDown}
          tone={netProfitToday >= 0 ? "success" : "danger"}
          hint="Sales minus expenses"
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
            <CardDescription>Last 30 days · sales figure is a manual placeholder until POS is connected</CardDescription>
          </div>
        </CardHeader>

        {/* Summary strip */}
        {reportsLoading ? (
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryPill
              icon={PiggyBank}
              label="Total sales"
              value={formatCurrency(periodSales)}
              tone="accent"
            />
            <SummaryPill
              icon={Receipt}
              label="Total expenses"
              value={formatCurrency(periodExpenses)}
              tone="secondary"
            />
            <SummaryPill
              icon={Wallet}
              label="Net profit"
              value={formatCurrency(periodProfit)}
              tone={periodProfit >= 0 ? "success" : "danger"}
            />
            <SummaryPill
              icon={periodProfit >= 0 ? TrendingUp : TrendingDown}
              label="Margin"
              value={`${margin.toFixed(1)}%`}
              tone={margin >= 0 ? "primary" : "danger"}
            />
          </div>
        )}

        {reportsLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : dailyProfit.every((d) => d.sales === 0) ? (
          <p className="py-10 text-center text-sm text-ink-faint">
            No sales data yet — log an expense to see the trend appear.
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
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }}
                  axisLine={{ stroke: "var(--color-line)" }}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={24}
                />
                <YAxis
                  tickFormatter={(v) => formatCurrencyCompact(v)}
                  tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }}
                  axisLine={false}
                  tickLine={false}
                  width={68}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value ?? 0))}
                  labelFormatter={(label) => label}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-line)",
                    boxShadow: "0 6px 20px rgba(62,39,35,0.12)",
                    fontSize: 13,
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={32}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span className="text-xs text-ink-soft">{value}</span>}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="Sales"
                  stroke="#F1C40F"
                  strokeWidth={2.5}
                  fill="url(#salesGradient)"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#C0392B"
                  strokeWidth={2.5}
                  fill="url(#expensesGradient)"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  name="Profit"
                  stroke="#E67E22"
                  strokeWidth={2.5}
                  fill="url(#profitGradient)"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Recent expenses</CardTitle>
              <CardDescription>Latest transactions logged</CardDescription>
            </div>
            <Link
              to="/expenses"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
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
                    <Badge
                      className="border-0"
                      style={{
                        backgroundColor: `${CATEGORY_COLORS[exp.category]}1a`,
                        color: CATEGORY_COLORS[exp.category],
                      }}
                    >
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
              <CardTitle>Active crew</CardTitle>
              <CardDescription>Currently employed</CardDescription>
            </div>
            <Link
              to="/employees"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {activeEmployees.slice(0, 5).map((emp) => {
                const clockedIn = clockedInNow.some((a) => a.employeeId === emp.id);
                return (
                  <div key={emp.id} className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: emp.avatarColor }}
                    >
                      {emp.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                    </div>
                    <span className="flex-1 truncate text-sm text-ink">{emp.name}</span>
                    <Badge variant={clockedIn ? "success" : "neutral"}>
                      {clockedIn ? "On shift" : "Off"}
                    </Badge>
                  </div>
                );
              })}
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
  isLoading,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "secondary" | "accent" | "success" | "danger";
  hint: string;
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
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">{label}</p>
          {isLoading ? (
            <Skeleton className="mt-2 h-7 w-24" />
          ) : (
            <p className="stamp mt-1 text-2xl font-semibold text-ink">{value}</p>
          )}
          <p className="mt-1 text-xs text-ink-faint">{hint}</p>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
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