import { useMemo, useState } from "react";
import { Trash2, ShoppingBag, CheckCircle } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/AlertDialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";
import { useDeleteOrder, useClaimOrder } from "../hooks/useOrders";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useToast } from "@/components/ui/useToast";
import type { Order } from "../types";

const PAGE_SIZE = 10;

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

interface Props {
  orders: Order[];
}

export function OrdersList({ orders }: Props) {
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [claimTarget, setClaimTarget] = useState<Order | null>(null);
  const { data: products = [] } = useProducts();
  const deleteOrder = useDeleteOrder();
  const claimOrder = useClaimOrder();
  const { toast } = useToast();

  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const groups = useMemo(() => {
    const map = new Map<string, Order[]>();
    for (const order of orders) {
      const list = map.get(order.date) ?? [];
      list.push(order);
      map.set(order.date, list);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
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

  async function handleClaim() {
    if (!claimTarget) return;
    try {
      await claimOrder.mutateAsync(claimTarget.id);
      toast({ title: "Order confirmed", description: `${claimTarget.customerName} — marked as completed`, variant: "success" });
    } catch {
      toast({ title: "Couldn't confirm order", variant: "error" });
    } finally {
      setClaimTarget(null);
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

          return (
            <div key={date} className="overflow-hidden rounded-xl border border-line bg-surface">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-ink/[0.02] px-5 py-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="stamp text-base font-semibold text-ink">{formatDate(date)}</span>
                  <span className="text-sm text-ink-soft">
                    {items.length} order{items.length === 1 ? "" : "s"}
                  </span>
                </div>
                <span className="font-semibold text-ink">{formatCurrency(dayTotal)}</span>
              </div>

              <div className="divide-y divide-dashed divide-line">
                {items.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm hover:bg-primary/[0.02]"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <Badge className={`min-w-0 text-[10px] ${STATUS_BADGE[order.status]}`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                      <span className="font-medium text-ink truncate">{order.customerName}</span>
                      {order.scheduledTime && (
                        <span className="hidden sm:inline whitespace-nowrap text-xs font-medium text-primary-dark bg-primary/10 rounded-md px-1.5 py-0.5">
                          {order.scheduledTime}
                        </span>
                      )}
                      <span className="hidden sm:inline truncate text-xs text-ink-faint">
                        {order.items.map((item) => {
                          const product = productMap.get(item.productId);
                          return `${product?.name ?? "Unknown"} ×${item.quantity}`;
                        }).join(", ")}
                      </span>
                      {order.notes && (
                        <span className="hidden sm:inline truncate text-xs text-ink-faint">· {order.notes}</span>
                      )}
                    </div>
                    <span className="shrink-0 font-semibold text-ink">{formatCurrency(order.total)}</span>
                    {order.status === "pending" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-ink-faint hover:text-green-600"
                        onClick={() => setClaimTarget(order)}
                        aria-label="Confirm order"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                      </Button>
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
                ))}
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

      <AlertDialog open={!!claimTarget} onOpenChange={(v) => !v && setClaimTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm order</AlertDialogTitle>
            <AlertDialogDescription>
              Mark this order as completed? This will update the order status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClaim}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
