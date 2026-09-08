import type { ReactNode } from "react";
import {
  Building2,
  CalendarDays,
  Phone,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  User,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useBranches } from "@/features/branches";
import { useOrders } from "@/features/orders";
import type { Sale } from "../types";

const STATUS_CHIP: Record<OrderStatus, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

function HeroChip({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-surface/80 px-3 py-2">
      <span className="shrink-0 text-primary-dark">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-ink-faint">{label}</p>
        <p className="truncate text-sm font-medium text-ink">{value}</p>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm text-ink-faint">
        {icon}
        <span>{label}</span>
      </div>
      <span className="truncate text-sm font-medium text-ink">{value}</span>
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
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-primary-dark" />
            Sale details
          </DialogTitle>
        </DialogHeader>

        {sale && (
          <div className="space-y-4">
            {/* Hero panel */}
            <div className="overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/15 via-surface to-accent/10 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary-dark">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {product?.name ?? "Unknown product"}
                    </p>
                    <p className="text-xs text-ink-faint">
                      {sale.quantitySold} × {formatCurrency(sale.unitPrice)}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-ink-faint">Total</p>
                  <p className="text-2xl font-bold text-ink">{formatCurrency(sale.amount)}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-primary/10 pt-3">
                <HeroChip icon={<Building2 className="h-4 w-4" />} label="Branch" value={branch?.name ?? "—"} />
                <HeroChip icon={<CalendarDays className="h-4 w-4" />} label="Date" value={formatDate(sale.date)} />
              </div>
            </div>

            {/* Linked order */}
            {order ? (
              <div className="rounded-2xl border border-line bg-surface p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                    <Receipt className="h-3.5 w-3.5" />
                    From order
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CHIP[order.status]}`}
                  >
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>
                <div className="mt-3 space-y-2.5 border-t border-dashed border-line pt-3">
                  <Row icon={<Receipt className="h-4 w-4" />} label="Order no." value={order.orderNumber} />
                  <Row icon={<User className="h-4 w-4" />} label="Customer" value={order.customerName} />
                  <Row icon={<Phone className="h-4 w-4" />} label="Contact" value={order.contactNumber} />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3.5 text-sm text-primary-dark">
                <ShoppingBag className="h-4 w-4 shrink-0" />
                Walk-in sale — not linked to a scheduled order
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}