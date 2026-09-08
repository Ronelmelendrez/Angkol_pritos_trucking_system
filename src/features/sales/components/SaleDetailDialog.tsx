import type { ReactNode } from "react";
import { Building2, CalendarDays, CircleCheck, Package, Receipt, ShoppingCart, StickyNote, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useBranches } from "@/features/branches";
import { useOrders } from "@/features/orders";
import type { Sale } from "../types";

function DetailItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-line bg-ink/[0.02] px-2.5 py-1.5">
      <span className="shrink-0 text-ink-faint">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-ink-faint">{label}</p>
        <p className="truncate text-sm font-medium text-ink">{value}</p>
      </div>
    </div>
  );
}

interface Props {
  sale: Sale | null;
  onClose: () => void;
}

export function SaleDetailDialog({ sale, onClose }: Props) {
  const { data: products = [] } = useProducts();
  const { data: branches = [] } = useBranches();
  const { data: orders = [] } = useOrders();

  const product = sale?.productId ? products.find((p) => p.id === sale.productId) : undefined;
  const branch = sale?.branchId ? branches.find((b) => b.id === sale.branchId) : undefined;
  const order = sale?.orderId ? orders.find((o) => o.id === sale.orderId) : undefined;

  return (
    <Dialog open={!!sale} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-primary-dark" />
              View sale
            </DialogTitle>
            {sale && (
              <span className="text-xl font-bold text-ink">{formatCurrency(sale.amount)}</span>
            )}
          </div>
        </DialogHeader>

        {sale ? (
          <div className="space-y-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="neutral">{product?.name ?? "Unknown product"}</Badge>
              <span className="text-xs text-ink-faint">{formatDate(sale.date)}</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <DetailItem
                icon={<Package className="h-3.5 w-3.5" />}
                label="Product"
                value={product?.name ?? "Unknown"}
              />
              <DetailItem
                icon={<Building2 className="h-3.5 w-3.5" />}
                label="Branch"
                value={branch?.name ?? "—"}
              />
              <DetailItem
                icon={<CalendarDays className="h-3.5 w-3.5" />}
                label="Date"
                value={formatDate(sale.date)}
              />
              <DetailItem
                icon={<ShoppingCart className="h-3.5 w-3.5" />}
                label="Quantity"
                value={`${sale.quantitySold} × ${formatCurrency(sale.unitPrice)}`}
              />
              {order && (
                <>
                  <DetailItem
                    icon={<Receipt className="h-3.5 w-3.5" />}
                    label="Order"
                    value={order.orderNumber}
                  />
                  <DetailItem
                    icon={<User className="h-3.5 w-3.5" />}
                    label="Customer"
                    value={`${order.customerName} · ${order.contactNumber}`}
                  />
                  <DetailItem
                    icon={<CircleCheck className="h-3.5 w-3.5" />}
                    label="Order status"
                    value={ORDER_STATUS_LABELS[order.status]}
                  />
                </>
              )}
              {sale.notes && (
                <DetailItem icon={<StickyNote className="h-3.5 w-3.5" />} label="Notes" value={sale.notes} />
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}