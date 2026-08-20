import { useState } from "react";
import { Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/AlertDialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/utils/currency";
import { formatDate, formatTime12h } from "@/utils/date";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";
import { useDeleteOrder } from "../hooks/useOrders";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useToast } from "@/components/ui/useToast";
import { OrderDetailDialog } from "./OrderDetailDialog";
import type { Order } from "../types";

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

interface Props {
  order: Order;
}

export function OrderGridCard({ order }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const deleteOrder = useDeleteOrder();
  const { data: products = [] } = useProducts();
  const { toast } = useToast();

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

  const productMap = new Map(products.map((p) => [p.id, p]));

  return (
    <div className="ticket ticket-perf flex cursor-pointer flex-col gap-2 p-4 transition-colors hover:bg-primary/[0.03]" onClick={() => setDetailOpen(true)}>
      <div className="flex items-start justify-between gap-2">
        <Badge className={`shrink-0 text-[10px] ${STATUS_BADGE[order.status]}`}>
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-ink-faint hover:text-danger"
          onClick={(e) => { e.stopPropagation(); setDeleteTarget(order); }}
          aria-label="Delete order"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <p className="font-medium text-ink truncate">{order.customerName}</p>

      <p className="text-lg font-bold text-ink sm:text-xl">{formatCurrency(order.total)}</p>

      <p className="text-sm text-ink truncate">
        {order.items.map((item) => {
          const product = productMap.get(item.productId);
          return `${product?.name ?? "Unknown"} ×${item.quantity}`;
        }).join(", ")}
      </p>

      {order.scheduledTime && (
        <p className="text-xs font-medium text-primary-dark">{formatTime12h(order.scheduledTime)}</p>
      )}

      <div className="mt-auto flex items-center justify-between text-xs text-ink-faint">
        <span>{formatDate(order.date)}</span>
        {order.notes && <span className="truncate">{order.notes}</span>}
      </div>

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

      <OrderDetailDialog order={detailOpen ? order : null} onOpenChange={setDetailOpen} />
    </div>
  );
}
