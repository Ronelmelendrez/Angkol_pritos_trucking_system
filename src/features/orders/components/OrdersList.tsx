import { useMemo, useState } from "react";
import { Trash2, ShoppingBag } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/AlertDialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { formatCurrency } from "@/utils/currency";
import { formatDate, formatTime12h, getTimeUrgency, isDateToday } from "@/utils/date";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";
import { useDeleteOrder } from "../hooks/useOrders";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useToast } from "@/components/ui/useToast";
import { OrderDetailDialog } from "./OrderDetailDialog";
import { OrderCancellationDialog } from "./OrderCancellationDialog";
import { OrderCompletionDialog } from "./OrderCompletionDialog";
import type { Order } from "../types";

const PAGE_SIZE = 10;

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

export function OrdersList({ orders }: Props) {
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [completeTarget, setCompleteTarget] = useState<Order | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const [detailTarget, setDetailTarget] = useState<Order | null>(null);
  const { data: products = [] } = useProducts();
  const deleteOrder = useDeleteOrder();
  const { toast } = useToast();

  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const groups = useMemo(() => {
    const map = new Map<string, Order[]>();
    for (const order of orders) {
      const list = map.get(order.date) ?? [];
      list.push(order);
      map.set(order.date, list);
    }

    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, items]) => {
        const sorted = [...items].sort((a, b) => {
          if (!a.scheduledTime && !b.scheduledTime) return 0;
          if (!a.scheduledTime) return 1;
          if (!b.scheduledTime) return -1;
          return a.scheduledTime.localeCompare(b.scheduledTime);
        });
        return [date, sorted] as const;
      });
  }, [orders]);

  const totalPages = Math.max(1, Math.ceil(groups.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageGroups = groups.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteOrder.mutateAsync(deleteTarget.id);
      toast({ title: "Order removed", variant: "default" });
    } catch {
      toast({ title: "Couldn't remove order", variant: "error" });
    } finally {
      setDeleteTarget(null);
    }
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line py-14 text-center">
        <ShoppingBag className="mb-2 h-8 w-8 text-ink-faint" />
        <p className="text-sm font-medium text-ink">No orders yet</p>
        <p className="text-xs text-ink-faint">Create your first order to start tracking.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4">
        {pageGroups.map(([date, items]) => {
          const dayTotal = items.reduce((sum, o) => sum + o.total, 0);
          const isToday = isDateToday(date);

          return (
            <div key={date} className="overflow-hidden rounded-xl border border-line bg-surface">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-ink/[0.02] px-4 py-3 sm:px-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="stamp text-base font-semibold text-ink">
                    {isToday ? "Today" : formatDate(date)}
                  </span>
                  <span className="text-sm text-ink-soft">
                    {items.length} order{items.length === 1 ? "" : "s"}
                  </span>
                </div>
                <span className="font-semibold text-ink">{formatCurrency(dayTotal)}</span>
              </div>

              <div className="divide-y divide-dashed divide-line">
                {items.map((order) => {
                  const urgency = isToday && order.status === "scheduled" ? getTimeUrgency(order.scheduledTime ?? "") : null;
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-primary/[0.02] sm:px-5"
                    >
                      <div className="flex min-w-0 flex-1 cursor-pointer items-center gap-3" onClick={() => setDetailTarget(order)}>
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
                        <span className="hidden min-w-0 flex-1 truncate text-xs text-ink-faint sm:inline">
                          {order.items.map((item) => {
                            const product = productMap.get(item.productId);
                            return `${product?.name ?? "Unknown"} ×${item.quantity}`;
                          }).join(", ")}
                        </span>
                        {order.notes && (
                          <span className="hidden shrink-0 sm:inline truncate text-xs text-ink-faint">· {order.notes}</span>
                        )}
                      </div>
                      <span className="shrink-0 font-semibold text-ink">{formatCurrency(order.total)}</span>
                      {order.status === "scheduled" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 text-ink-faint hover:text-green-600"
                            onClick={() => setCompleteTarget(order)}
                            aria-label="Complete order"
                          >
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 text-ink-faint hover:text-danger"
                            onClick={() => setCancelTarget(order)}
                            aria-label="Cancel order"
                          >
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-ink-faint hover:text-danger"
                        onClick={() => setDeleteTarget(order)}
                        aria-label="Delete order"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete order</AlertDialogTitle>
            <AlertDialogDescription>
              Remove this order record? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <OrderCompletionDialog
        order={completeTarget}
        onClose={() => setCompleteTarget(null)}
      />

      <OrderDetailDialog
        order={detailTarget}
        onOpenChange={(v) => !v && setDetailTarget(null)}
        onComplete={(o) => { setDetailTarget(null); setCompleteTarget(o); }}
        onCancel={(o) => { setDetailTarget(null); setCancelTarget(o); }}
      />

      <OrderCancellationDialog
        orderId={cancelTarget?.id ?? null}
        orderNumber={cancelTarget?.orderNumber}
        onClose={() => setCancelTarget(null)}
      />
    </div>
  );
}
