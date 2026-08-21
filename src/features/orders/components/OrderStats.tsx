import { useMemo } from "react";
import { ShoppingBag, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/utils/currency";
import { formatTime12h, getTimeUrgency, isDateToday } from "@/utils/date";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";
import type { Order } from "../types";

const STATUS_BADGE: Record<OrderStatus, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const URGENCY_DOT: Record<string, string> = {
  overdue: "bg-red-500 animate-pulse",
  soon: "bg-amber-400",
  upcoming: "bg-primary/40",
};

interface Props {
  orders: Order[];
}

export function OrderStats({ orders }: Props) {
  const stats = useMemo(() => {
    const today = orders.filter((o) => isDateToday(o.date));
    const scheduled = today.filter((o) => o.status === "scheduled");
    const completed = today.filter((o) => o.status === "completed");
    const total = today.reduce((sum, o) => sum + o.total, 0);
    return { today, scheduled, completed, total };
  }, [orders]);

  const sortedToday = useMemo(() => {
    return [...stats.today].sort((a, b) => {
      if (!a.scheduledTime && !b.scheduledTime) return 0;
      if (!a.scheduledTime) return 1;
      if (!b.scheduledTime) return -1;
      return a.scheduledTime.localeCompare(b.scheduledTime);
    });
  }, [stats.today]);

  if (stats.today.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-3 sm:px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-accent-dark">
            <ShoppingBag className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-ink-faint">Today's Orders</p>
            <p className="text-xl font-bold text-ink sm:text-2xl">{stats.today.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-3 sm:px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
            <Clock className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-ink-faint">Scheduled</p>
            <p className="text-xl font-bold text-ink sm:text-2xl">{stats.scheduled.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-3 sm:px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700">
            <CheckCircle className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-ink-faint">Completed</p>
            <p className="text-xl font-bold text-ink sm:text-2xl">{stats.completed.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-3 sm:px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-dark">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-ink-faint">Today's Total</p>
            <p className="text-xl font-bold text-ink sm:text-2xl">{formatCurrency(stats.total)}</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-ink/[0.02] px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="stamp text-base font-semibold text-ink">Today</span>
            <span className="text-sm text-ink-soft">
              {stats.today.length} order{stats.today.length === 1 ? "" : "s"}
            </span>
          </div>
          <span className="font-semibold text-ink">{formatCurrency(stats.total)}</span>
        </div>

        <div className="divide-y divide-dashed divide-line">
          {sortedToday.map((order) => {
            const urgency = order.status === "scheduled" ? getTimeUrgency(order.scheduledTime ?? "") : null;
            return (
              <div
                key={order.id}
                className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-primary/[0.02] sm:px-5"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {urgency && (
                    <span className={`h-2 w-2 shrink-0 rounded-full ${URGENCY_DOT[urgency]}`} title={urgency === "overdue" ? "Past scheduled time" : urgency === "soon" ? "Due within 1 hour" : ""} />
                  )}
                  <Badge className={`min-w-0 shrink-0 text-[10px] ${STATUS_BADGE[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                  <span className="min-w-0 flex-1 truncate font-medium text-ink">{order.customerName}</span>
                  {order.scheduledTime && (
                    <span className={`hidden shrink-0 sm:inline whitespace-nowrap text-xs font-medium rounded-md px-1.5 py-0.5 ${
                      urgency === "overdue"
                        ? "text-red-700 bg-red-50"
                        : urgency === "soon"
                          ? "text-amber-700 bg-amber-50"
                          : "text-primary-dark bg-primary/10"
                    }`}>
                      {formatTime12h(order.scheduledTime)}
                    </span>
                  )}
                </div>
                <span className="shrink-0 font-semibold text-ink">{formatCurrency(order.total)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
