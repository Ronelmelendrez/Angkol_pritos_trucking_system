import { useMemo} from "react";
import { ShoppingBag, Receipt, Clock, HandCoins, PiggyBank, ArrowRight, CheckCircle} from "lucide-react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { subDays, format as formatDateFns } from "date-fns";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useOrders } from "@/features/orders/hooks/useOrders";
import { useExpenses } from "@/features/expenses/hooks/useExpenses";
import { useAttendance } from "@/features/attendance/hooks/useAttendance";
import { useAdvances } from "@/features/advances/hooks/useAdvances";
import { Sparkline } from "@/components/charts/Sparkline";
import { formatCurrency} from "@/utils/currency";
import { useChartLabelCount, chartXInterval } from "@/utils/chartTicks";
import { isDateToday, formatDate } from "@/utils/date";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";

const QUICK_LINKS = [
  { to: "/employee/orders", label: "New Order", desc: "Create and track orders", icon: ShoppingBag, color: "bg-indigo-100 text-indigo-600" },
  { to: "/employee/expenses", label: "Add Expense", desc: "Log a new business expense", icon: Receipt, color: "bg-orange-100 text-orange-600" },
  { to: "/employee/attendance", label: "Attendance", desc: "Clock in/out and view records", icon: Clock, color: "bg-blue-100 text-blue-600" },
  { to: "/employee/advances", label: "Cash Advances", desc: "Request or view advances", icon: HandCoins, color: "bg-green-100 text-green-600" },
  { to: "/employee/cash", label: "Cash Drawer", desc: "Set opening cash", icon: PiggyBank, color: "bg-purple-100 text-purple-600" },
];

const STATUS_COLORS: Record<OrderStatus, string> = {
  scheduled: "#3B82F6",
  completed: "#22C55E",
  cancelled: "#EF4444",
};

export function EmployeeDashboardPage() {
  const { user } = useAuth();
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses();
  const { data: attendance = [], isLoading: attendanceLoading } = useAttendance();
  const { data: advances = [] } = useAdvances();
  const labelCount = useChartLabelCount();

  const isLoading = ordersLoading || expensesLoading || attendanceLoading;

  // Today's data
  const myExpenses = useMemo(() => expenses.filter((e) => !user?.id || e.createdBy === user.id), [expenses, user]);
  const myOrders = useMemo(() => orders.filter((o) => !user?.id || o.createdBy === user.id), [orders, user]);
  const todaysOrders = useMemo(() => myOrders.filter((o) => isDateToday(o.date)), [myOrders]);
  const todaysExpenses = useMemo(() => myExpenses.filter((e) => isDateToday(e.date)), [myExpenses]);
  const todaysOrderTotal = todaysOrders.reduce((sum, o) => sum + o.total, 0);
  const todaysExpensesTotal = todaysExpenses.reduce((sum, e) => sum + e.amount, 0);
  const pendingAdvances = advances.filter((a) => a.status === "pending");

  // Today's orders by status
  const todayStatusBreakdown = useMemo(() => {
    const counts: Record<OrderStatus, number> = { scheduled: 0, completed: 0, cancelled: 0 };
    todaysOrders.forEach((o) => { counts[o.status]++; });
    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([status, count]) => ({
        status: ORDER_STATUS_LABELS[status as OrderStatus],
        count,
        fill: STATUS_COLORS[status as OrderStatus],
      }));
  }, [todaysOrders]);

  // 7-day order trend
  const last7 = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      return {
        label: formatDateFns(d, "EEE"),
        full: formatDateFns(d, "yyyy-MM-dd"),
      };
    });
    return days.map((day) => ({
      label: day.label,
      orders: myOrders.filter((o) => o.date === day.full).length,
      total: myOrders.filter((o) => o.date === day.full).reduce((sum, o) => sum + o.total, 0),
    }));
  }, [myOrders]);

  const last7OrderCounts = last7.map((d) => d.orders);

  // Scheduled orders (upcoming)
  const scheduledOrders = useMemo(() =>
    myOrders
      .filter((o) => o.status === "scheduled")
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5),
  [myOrders]);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="stamp text-2xl font-bold text-ink">Welcome, {user?.name ?? "Employee"}</h1>
        <p className="mt-1 text-sm text-ink-soft">Here's what's happening today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Today's orders"
          value={`${todaysOrders.length}`}
          icon={ShoppingBag}
          tone="accent"
          hint={`${formatCurrency(todaysOrderTotal)} total`}
          sparkline={last7OrderCounts}
          sparkColor="#6366F1"
          isLoading={isLoading}
        />
        <StatCard
          label="Today's expenses"
          value={formatCurrency(todaysExpensesTotal)}
          icon={Receipt}
          tone="secondary"
          hint={`${todaysExpenses.length} logged`}
          isLoading={isLoading}
        />
        <StatCard
          label="Scheduled orders"
          value={`${scheduledOrders.length}`}
          icon={CheckCircle}
          tone="accent"
          hint="Awaiting pickup"
          isLoading={isLoading}
        />
        <StatCard
          label="Pending advances"
          value={`${pendingAdvances.length}`}
          icon={HandCoins}
          tone="secondary"
          hint={formatCurrency(pendingAdvances.reduce((s, a) => s + a.amount, 0))}
          isLoading={isLoading}
        />
      </div>

      {/* Today's Orders Chart + Status Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Order volume</CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </div>
          </CardHeader>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : last7.every((d) => d.orders === 0) ? (
            <p className="py-10 text-center text-sm text-ink-faint">
              No orders yet — schedule your first order to see the trend.
            </p>
          ) : (
            <div className="h-64 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last7} margin={{ left: 0, right: 12, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="orderBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366F1" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#6366F1" stopOpacity={0.5} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }}
                    axisLine={{ stroke: "var(--color-line)" }}
                    tickLine={false}
                    interval={chartXInterval(7, labelCount)}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip
                    formatter={(value, name) => name === "Orders" ? [`${value} orders`] : [formatCurrency(Number(value ?? 0))]}
                    contentStyle={{ borderRadius: 12, border: "1px solid var(--color-line)", boxShadow: "0 6px 20px rgba(62,39,35,0.12)", fontSize: 13 }}
                  />
                  <Legend verticalAlign="top" height={32} iconType="circle" iconSize={8} formatter={(value) => <span className="text-xs text-ink-soft">{value}</span>} />
                  <Bar dataKey="orders" name="Orders" fill="url(#orderBarGrad)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="total" name="Revenue" fill="#F1C40F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Today's status</CardTitle>
              <CardDescription>Order breakdown</CardDescription>
            </div>
          </CardHeader>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : todayStatusBreakdown.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-faint">No orders today yet.</p>
          ) : (
            <div className="space-y-3">
              {todayStatusBreakdown.map((item) => (
                <div key={item.status} className="flex items-center gap-3">
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="flex-1 text-sm text-ink">{item.status}</span>
                  <span className="text-sm font-bold text-ink">{item.count}</span>
                </div>
              ))}
              <div className="border-t border-line pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ink">Today's total</span>
                  <span className="text-lg font-bold text-ink">{formatCurrency(todaysOrderTotal)}</span>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Scheduled orders + Quick links */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Scheduled orders</CardTitle>
              <CardDescription>Upcoming pickups</CardDescription>
            </div>
            <Link to="/employee/orders" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : scheduledOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-faint">All caught up — no scheduled orders.</p>
          ) : (
            <div className="divide-y divide-line">
              {scheduledOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{order.customerName}</p>
                    <div className="flex items-center gap-2 text-xs text-ink-faint">
                      <span>{formatDate(order.date)}</span>
                      {order.scheduledTime && (
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary-dark">
                          {order.scheduledTime}
                        </span>
                      )}
                      <span>· {order.items.length} item{order.items.length === 1 ? "" : "s"}</span>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-ink">{formatCurrency(order.total)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Quick actions</CardTitle>
              </div>
            </CardHeader>
            <div className="space-y-2">
              {QUICK_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link key={link.to} to={link.to}>
                    <div className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-primary/[0.03]">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${link.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink">{link.label}</p>
                        <p className="text-xs text-ink-faint">{link.desc}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>My attendance</CardTitle>
                <CardDescription>This month</CardDescription>
              </div>
            </CardHeader>
            {attendanceLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (() => {
              const now = new Date();
              const monthStr = formatDateFns(now, "yyyy-MM");
              const monthRecords = attendance.filter((a) => a.date.startsWith(monthStr));
              const present = monthRecords.filter((a) => a.status === "present" || (a.clockIn && a.status !== "absent")).length;
              const absent = monthRecords.filter((a) => a.status === "absent").length;
              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-lg bg-ink/3 px-3 py-2">
                    <span className="text-xs text-ink-faint">Present</span>
                    <span className="text-sm font-bold text-green-600">{present} days</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-ink/3 px-3 py-2">
                    <span className="text-xs text-ink-faint">Absent</span>
                    <span className="text-sm font-bold text-red-600">{absent} days</span>
                  </div>
                </div>
              );
            })()}
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label, value, icon: Icon, tone, hint, sparkline, sparkColor, isLoading,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "secondary" | "accent" | "success" | "danger";
  hint: string;
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
            <Skeleton className="mt-2 h-7 w-20" />
          ) : (
            <p className="mt-1 stamp text-2xl font-semibold text-ink">{value}</p>
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
