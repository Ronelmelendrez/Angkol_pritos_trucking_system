import { useMemo, useRef } from "react";
import { CheckCircle, Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { formatCurrency } from "@/utils/currency";
import { formatDate, formatTime12h } from "@/utils/date";
import { useProducts } from "@/features/products/hooks/useProducts";
import type { Order } from "../types";

interface Props {
  order: Order | null;
  onClose: () => void;
}

export function OrderConfirmationDialog({ order, onClose }: Props) {
  const slipRef = useRef<HTMLDivElement>(null);
  const { data: products = [] } = useProducts();
  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p.name])), [products]);

  if (!order) return null;

  // Captured so TypeScript keeps the non-null narrowing inside callbacks
  const confirmedOrder = order;

  function handlePrint() {
    const content = slipRef.current;
    if (!content) return;
    const win = window.open("", "_blank", "width=400,height=600");
    if (!win) return;
    win.document.write(`
      <html><head><title>Order ${confirmedOrder.orderNumber}</title>
      <style>
        body { font-family: 'Courier New', monospace; padding: 16px; font-size: 12px; }
        .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
        .row { display: flex; justify-content: space-between; margin: 4px 0; }
        .total { border-top: 2px dashed #000; padding-top: 8px; margin-top: 8px; font-weight: bold; }
      </style></head><body>
      ${content.innerHTML}
      <script>window.onload=function(){window.print();window.close()}</script>
      </body></html>
    `);
    win.document.close();
  }

  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Order Confirmed
          </DialogTitle>
        </DialogHeader>

        <div ref={slipRef} className="rounded-lg border border-line bg-ink/[0.02] p-4 space-y-3 text-sm">
          <div className="text-center border-b border-dashed border-ink-faint pb-3">
            <p className="font-bold text-base text-ink">ORDER CONFIRMATION</p>
            <p className="text-xs text-ink-faint">{order.orderNumber}</p>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-ink-faint">Customer</span>
              <span className="font-medium text-ink">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-faint">Contact</span>
              <span className="text-ink">{order.contactNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-faint">Date</span>
              <span className="text-ink">{formatDate(order.date)}</span>
            </div>
            {order.scheduledTime && (
              <div className="flex justify-between">
                <span className="text-ink-faint">Time</span>
                <span className="text-ink">{formatTime12h(order.scheduledTime)}</span>
              </div>
            )}
          </div>

          <div className="border-t border-dashed border-ink-faint pt-2 space-y-1">
            <p className="text-xs font-semibold uppercase text-ink-faint">Items</p>
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-ink">
                <span>{item.quantity}× {productMap.get(item.productId) ?? "Unknown"}</span>
                <span>{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-ink-faint pt-2 space-y-1">
            <div className="flex justify-between">
              <span className="font-medium text-ink">Total</span>
              <span className="font-bold text-ink">{formatCurrency(order.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-faint">Deposit</span>
              <span className="text-ink">{formatCurrency(order.depositAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-ink">Balance</span>
              <span className="font-bold text-ink">{formatCurrency(order.balanceAmount)}</span>
            </div>
          </div>

          {order.notes && (
            <div className="border-t border-dashed border-ink-faint pt-2">
              <p className="text-xs text-ink-faint">Note: {order.notes}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1 gap-1.5" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button className="flex-1" onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
