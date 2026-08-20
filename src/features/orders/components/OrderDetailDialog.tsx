import { useMemo } from "react";
import { Badge } from "@/components/ui/Badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { formatCurrency } from "@/utils/currency";
import { formatDate, formatTime12h } from "@/utils/date";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";
import { useProducts } from "@/features/products/hooks/useProducts";
import type { Order } from "../types";

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

interface Props {
  order: Order | null;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailDialog({ order, onOpenChange }: Props) {
  const { data: products = [] } = useProducts();

  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  if (!order) return null;

  return (
    <Dialog open={!!order} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {order.customerName}
            <Badge className={`text-[10px] ${STATUS_BADGE[order.status]}`}>
              {ORDER_STATUS_LABELS[order.status]}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {formatDate(order.date)}
            {order.scheduledTime && ` · ${formatTime12h(order.scheduledTime)}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-lg border border-line bg-ink/[0.02] px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Order Items</p>
            <div className="mt-2 space-y-2">
              {order.items.map((item) => {
                const product = productMap.get(item.productId);
                return (
                  <div key={item.id} className="flex items-center justify-between gap-2 text-sm">
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-ink">{product?.name ?? "Unknown"}</span>
                      <span className="ml-2 text-ink-faint">×{item.quantity}</span>
                    </div>
                    <span className="shrink-0 font-medium text-ink">{formatCurrency(item.amount)}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-line pt-2">
              <span className="text-sm font-medium text-ink">Total</span>
              <span className="text-lg font-bold text-ink">{formatCurrency(order.total)}</span>
            </div>
          </div>

          {order.notes && (
            <div className="rounded-lg border border-line bg-ink/[0.02] px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Notes</p>
              <p className="mt-1 text-sm text-ink">{order.notes}</p>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-ink-faint">
            <span>Created {formatDate(order.createdAt)}</span>
            {order.updatedAt !== order.createdAt && (
              <span>Updated {formatDate(order.updatedAt)}</span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
