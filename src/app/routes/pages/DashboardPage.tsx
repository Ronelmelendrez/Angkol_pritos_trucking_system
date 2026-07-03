import { TrendingUp, TrendingDown, Users, Receipt, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useExpenses } from "@/features/expenses/hooks/useExpenses";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import { useAttendance } from "@/features/attendance/hooks/useAttendance";
import { formatCurrency } from "@/utils/currency";
import { formatDate, isDateToday } from "@/utils/date";
import { CATEGORY_COLORS, DEFAULT_DAILY_SALES } from "@/lib/constants";

export function DashboardPage() {
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const { data: attendance = [], isLoading: attendanceLoading } = useAttendance();

  const todaysExpenses = expenses.filter((e) => isDateToday(e.date));
  const totalToday = todaysExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfitToday = DEFAULT_DAILY_SALES - totalToday;
  const activeEmployees = employees.filter((e) => e.isActive);
  const clockedInNow = attendance.filter((a) => isDateToday(a.date) && !a.clockOut);
  const recentExpenses = [...expenses]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 5);

  const isLoading = expensesLoading || employeesLoading || attendanceLoading;

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