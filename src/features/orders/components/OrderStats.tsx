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
  if (orders.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-sm text-ink-faint sm:px-5">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line bg-ink/[0.02]">
            <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-ink-faint sm:px-5">
              Order #
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-ink-faint sm:px-5">
              Customer
            </th>
            <th className="hidden px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-ink-faint sm:table-cell sm:px-5">
              Contact
            </th>
            <th className="hidden px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-ink-faint sm:table-cell sm:px-5">
              Time
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-ink-faint sm:px-5">
              Status
            </th>
            <th className="hidden px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-ink-faint md:table-cell sm:px-5">
              Items
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-ink-faint sm:px-5">
              Total
            </th>
            <th className="hidden px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-ink-faint lg:table-cell sm:px-5">
              Deposit
            </th>
            <th className="hidden px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-ink-faint lg:table-cell sm:px-5">
              Balance
            </th>
            <th className="px-4 py-2.5 text-center text-xs font-medium uppercase tracking-wide text-ink-faint sm:px-5">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dashed divide-line">
          {orders.map((order) => {
            const urgency = order.status === "scheduled" ? getTimeUrgency(order.scheduledTime ?? "") : null;
            return (
              <tr key={order.id} className="hover:bg-primary/[0.02] transition-colors">
                <td className="whitespace-nowrap px-4 py-2.5 font-medium text-ink sm:px-5">
                  {order.orderNumber}
                </td>
                <td className="px-4 py-2.5 font-medium text-ink sm:px-5">
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
                    <span className="truncate">{order.customerName}</span>
                  </div>
                </td>
                <td className="hidden whitespace-nowrap px-4 py-2.5 text-ink-soft sm:table-cell sm:px-5">
                  {order.contactNumber || "—"}
                </td>
                <td className="hidden whitespace-nowrap px-4 py-2.5 sm:table-cell sm:px-5">
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
                    <span className="text-xs text-ink-faint">—</span>
                  )}
                </td>
                <td className="px-4 py-2.5 sm:px-5">
                  <Badge className={`text-[10px] ${STATUS_BADGE[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                </td>
                <td className="hidden whitespace-nowrap px-4 py-2.5 text-right text-ink-soft md:table-cell sm:px-5">
                  {order.items.length}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right font-semibold text-ink sm:px-5">
                  {formatCurrency(order.total)}
                </td>
                <td className="hidden whitespace-nowrap px-4 py-2.5 text-right text-blue-600 lg:table-cell sm:px-5">
                  {order.depositAmount > 0 ? formatCurrency(order.depositAmount) : "—"}
                </td>
                <td className="hidden whitespace-nowrap px-4 py-2.5 text-right lg:table-cell sm:px-5">
                  {order.balanceAmount > 0 && order.balanceAmount !== order.total ? (
                    <span className="font-medium text-ink">{formatCurrency(order.balanceAmount)}</span>
                  ) : (
                    <span className="text-ink-faint">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-center sm:px-5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
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
          <tr className="border-t border-line bg-ink/[0.02]">
            <td colSpan={6} className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-ink-faint sm:px-5">
              Total
            </td>
            <td className="whitespace-nowrap px-4 py-2.5 text-right text-sm font-bold text-ink sm:px-5">
              {formatCurrency(orders.reduce((sum, o) => sum + o.total, 0))}
            </td>
            <td colSpan={3} className="px-4 py-2.5 text-center sm:px-5" />
          </tr>
        </tfoot>
      </table>
    </div>
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
              <p className="text-[11px] text-ink-faint">Pending</p>
              <p className="text-xl font-bold text-ink sm:text-2xl">{stats.today.length - stats.completed.length}</p>
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

        {/* ── Pending / Not Completed Table ────────── */}
        <div className="overflow-hidden rounded-xl border border-line bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-50/60 px-4 py-3 sm:px-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-base font-semibold text-amber-800">Pending</span>
              <span className="text-sm text-ink-soft">
                {pendingOrders.length} order{pendingOrders.length === 1 ? "" : "s"}
              </span>
            </div>
            <span className="font-semibold text-ink">{formatCurrency(pendingTotal)}</span>
          </div>
          <OrderTable
            orders={pendingOrders}
            onView={setSelectedOrder}
            emptyMessage="No pending orders today"
          />
        </div>

        {/* ── Completed Table ──────────────────────── */}
        <div className="overflow-hidden rounded-xl border border-line bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-green-50/60 px-4 py-3 sm:px-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-base font-semibold text-green-700">Completed</span>
              <span className="text-sm text-ink-soft">
                {completedOrders.length} order{completedOrders.length === 1 ? "" : "s"}
              </span>
            </div>
            <span className="font-semibold text-ink">{formatCurrency(completedTotal)}</span>
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
