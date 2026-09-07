import { useMemo, useState } from "react";
import { ShoppingBag, Clock, CheckCircle, AlertCircle, Eye } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { OrderDetailDialog } from "./OrderDetailDialog";
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

interface OrderTableProps {
  orders: Order[];
  onView: (order: Order) => void;
  emptyMessage: string;
}

function OrderTable({ orders, onView, emptyMessage }: OrderTableProps) {
  const total = orders.reduce((sum, o) => sum + o.total, 0);

  if (orders.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-sm text-ink-faint sm:px-5">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      {/* ── Table (desktop: lg+) ───────────────── */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-surface/50 text-left text-xs font-medium uppercase tracking-wide text-ink-faint">
              <th className="px-5 py-3">Order #</th>
              <th className="px-3 py-3">Customer</th>
              <th className="px-3 py-3">Contact</th>
              <th className="px-3 py-3">Time</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3 text-right">Items</th>
              <th className="px-3 py-3 text-right">Total</th>
              <th className="px-3 py-3 text-right">Deposit</th>
              <th className="px-3 py-3 text-right">Balance</th>
              <th className="px-5 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {orders.map((order) => {
              const urgency = order.status === "scheduled" ? getTimeUrgency(order.scheduledTime ?? "") : null;
              return (
                <tr key={order.id} className="transition-colors hover:bg-primary/[0.02]">
                  <td className="whitespace-nowrap px-5 py-3 align-middle font-medium text-ink">
                    {order.orderNumber}
                  </td>
                  <td className="px-3 py-3 align-middle">
                    <div className="flex min-w-0 items-center gap-2">
                      {urgency && (
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${URGENCY_DOT[urgency]}`}
                          title={
                            urgency === "overdue"
                              ? "Past scheduled time"
                              : urgency === "soon"
                                ? "Due within 1 hour"
                                : ""
                          }
                        />
                      )}
                      <span className="truncate font-medium text-ink">{order.customerName}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 align-middle text-ink-soft">
                    {order.contactNumber || "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 align-middle">
                    {order.scheduledTime ? (
                      <span
                        className={`inline-block whitespace-nowrap rounded-md px-1.5 py-0.5 text-xs font-medium ${
                          urgency === "overdue"
                            ? "bg-red-50 text-red-700"
                            : urgency === "soon"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-primary/10 text-primary-dark"
                        }`}
                      >
                        {formatTime12h(order.scheduledTime)}
                      </span>
                    ) : (
                      <span className="text-ink-faint">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 align-middle">
                    <Badge className={`text-[10px] ${STATUS_BADGE[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right align-middle text-ink-soft">
                    {order.items.length}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right align-middle font-semibold text-ink">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right align-middle text-blue-600">
                    {order.depositAmount > 0 ? formatCurrency(order.depositAmount) : "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right align-middle">
                    {order.balanceAmount > 0 && order.balanceAmount !== order.total ? (
                      <span className="font-medium text-ink">{formatCurrency(order.balanceAmount)}</span>
                    ) : (
                      <span className="text-ink-faint">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-center align-middle">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 px-3"
                      onClick={() => onView(order)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-line bg-ink/[0.02] text-right text-xs font-medium uppercase tracking-wide text-ink-faint">
              <td colSpan={6} className="px-5 py-3">Date Total</td>
              <td className="whitespace-nowrap px-3 py-3 text-sm font-bold text-ink">
                {formatCurrency(total)}
              </td>
              <td colSpan={3} className="px-3 py-3" />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── Cards (mobile & tablet: < lg) ──────── */}
      <div className="divide-y divide-line lg:hidden">
        {orders.map((order) => {
          const urgency = order.status === "scheduled" ? getTimeUrgency(order.scheduledTime ?? "") : null;
          return (
            <div key={order.id} className="px-4 py-3 sm:px-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {urgency && (
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${URGENCY_DOT[urgency]}`}
                        title={
                          urgency === "overdue"
                            ? "Past scheduled time"
                            : urgency === "soon"
                              ? "Due within 1 hour"
                              : ""
                        }
                      />
                    )}
                    <Badge className={`text-[10px] ${STATUS_BADGE[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                  </div>
                  <p className="mt-1 truncate text-sm font-semibold text-ink">{order.customerName}</p>
                  <p className="text-xs text-ink-faint">{order.orderNumber}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-ink">{formatCurrency(order.total)}</p>
                  {order.scheduledTime && (
                    <span
                      className={`mt-1 inline-block whitespace-nowrap rounded-md px-1.5 py-0.5 text-[11px] font-medium ${
                        urgency === "overdue"
                          ? "bg-red-50 text-red-700"
                          : urgency === "soon"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-primary/10 text-primary-dark"
                      }`}
                    >
                      {formatTime12h(order.scheduledTime)}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
                <span>Items: <span className="font-medium text-ink">{order.items.length}</span></span>
                {order.depositAmount > 0 && (
                  <span>
                    Deposit: <span className="font-medium text-blue-600">{formatCurrency(order.depositAmount)}</span>
                  </span>
                )}
                {order.balanceAmount > 0 && order.balanceAmount !== order.total && (
                  <span>
                    Balance: <span className="font-medium text-ink">{formatCurrency(order.balanceAmount)}</span>
                  </span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                {order.contactNumber && (
                  <span className="truncate text-xs text-ink-soft">{order.contactNumber}</span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => onView(order)}
                >
                  <Eye className="h-3.5 w-3.5" />
                  View details
                </Button>
              </div>
            </div>
          );
        })}
        <div className="flex items-center justify-between px-4 py-3 text-sm sm:px-5">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">Date Total</span>
          <span className="font-bold text-ink">{formatCurrency(total)}</span>
        </div>
      </div>
    </>
  );
}

interface Props {
  orders: Order[];
  onComplete?: (order: Order) => void;
  onCancel?: (order: Order) => void;
}

export function OrderStats({ orders, onComplete, onCancel }: Props) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const stats = useMemo(() => {
    const today = orders.filter((o) => isDateToday(o.date));
    const scheduled = today.filter((o) => o.status === "scheduled");
    const completed = today.filter((o) => o.status === "completed");
    const total = today.reduce((sum, o) => sum + o.total, 0);
    return { today, scheduled, completed, total };
  }, [orders]);

  const pendingOrders = useMemo(() => {
    return [...stats.today]
      .filter((o) => o.status !== "completed")
      .sort((a, b) => {
        if (!a.scheduledTime && !b.scheduledTime) return 0;
        if (!a.scheduledTime) return 1;
        if (!b.scheduledTime) return -1;
        return a.scheduledTime.localeCompare(b.scheduledTime);
      });
  }, [stats.today]);

  const completedOrders = useMemo(() => {
    return [...stats.today]
      .filter((o) => o.status === "completed")
      .sort((a, b) => {
        if (!a.scheduledTime && !b.scheduledTime) return 0;
        if (!a.scheduledTime) return 1;
        if (!b.scheduledTime) return -1;
        return a.scheduledTime.localeCompare(b.scheduledTime);
      });
  }, [stats.today]);

  if (stats.today.length === 0) return null;

  const pendingTotal = pendingOrders.reduce((sum, o) => sum + o.total, 0);
  const completedTotal = completedOrders.reduce((sum, o) => sum + o.total, 0);

  return (
    <>
      <div className="space-y-4">
        {/* ── Stats Cards ────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-3 sm:px-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent-dark">
              <ShoppingBag className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[11px] text-ink-faint">Today's Orders</p>
              <p className="text-xl font-bold text-ink sm:text-2xl">{stats.today.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-3 sm:px-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600">
              <Clock className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[11px] text-ink-faint">Pending</p>
              <p className="text-xl font-bold text-ink sm:text-2xl">{stats.today.length - stats.completed.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-3 sm:px-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/15 text-green-600">
              <CheckCircle className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[11px] text-ink-faint">Completed</p>
              <p className="text-xl font-bold text-ink sm:text-2xl">{stats.completed.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-3 sm:px-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-dark">
              <AlertCircle className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[11px] text-ink-faint">Today's Total</p>
              <p className="text-xl font-bold text-ink sm:text-2xl">{formatCurrency(stats.total)}</p>
            </div>
          </div>
        </div>

        {/* ── Pending / Not Completed Table ────────── */}
        <div className="overflow-hidden rounded-xl border border-line bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-ink/[0.02] px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-semibold text-ink">Pending</span>
              <span className="text-xs text-ink-faint">
                {pendingOrders.length} order{pendingOrders.length === 1 ? "" : "s"}
              </span>
            </div>
            <span className="text-sm font-semibold text-ink">{formatCurrency(pendingTotal)}</span>
          </div>
          <OrderTable
            orders={pendingOrders}
            onView={setSelectedOrder}
            emptyMessage="No pending orders today"
          />
        </div>

        {/* ── Completed Table ──────────────────────── */}
        <div className="overflow-hidden rounded-xl border border-line bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-ink/[0.02] px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-ink">Completed</span>
              <span className="text-xs text-ink-faint">
                {completedOrders.length} order{completedOrders.length === 1 ? "" : "s"}
              </span>
            </div>
            <span className="text-sm font-semibold text-ink">{formatCurrency(completedTotal)}</span>
          </div>
          <OrderTable
            orders={completedOrders}
            onView={setSelectedOrder}
            emptyMessage="No completed orders yet today"
          />
        </div>
      </div>

      {/* ── Order Detail Modal ──────────────────── */}
      <OrderDetailDialog
        order={selectedOrder}
        onOpenChange={(open) => {
          if (!open) setSelectedOrder(null);
        }}
        onComplete={onComplete}
        onCancel={onCancel}
      />
    </>
  );
}
