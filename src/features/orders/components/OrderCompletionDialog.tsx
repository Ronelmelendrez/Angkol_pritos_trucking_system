import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { formatCurrency } from "@/utils/currency";
import { todayISO } from "@/utils/date";
import { useAddOrderPayment, useOrderPayments } from "../hooks/useOrderPayments";
import { useCompleteOrder } from "../hooks/useOrders";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useToast } from "@/components/ui/useToast";
import type { Order } from "../types";

interface Props {
  order: Order | null;
  onClose: () => void;
}

export function OrderCompletionDialog({ order, onClose }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const orderId = order?.id ?? null;

  const { data: payments = [] } = useOrderPayments(orderId);
  const addPayment = useAddOrderPayment();
  const completeOrder = useCompleteOrder();

  /** null = untouched, so the input tracks the live remaining balance */
  const [amountInput, setAmountInput] = useState<string | null>(null);

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = order ? Math.max(0, Math.round((order.total - totalPaid) * 100) / 100) : 0;
  const value = amountInput ?? (remaining > 0 ? String(remaining) : "0");

  if (!order) return null;

  const parsed = parseFloat(value);
  const amountToCollect = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), remaining) : 0;
  const unpaidAfter = Math.round((remaining - amountToCollect) * 100) / 100;
  const isPending = addPayment.isPending || completeOrder.isPending;

  function handleClose() {
    setAmountInput(null);
    onClose();
  }

  async function handleConfirm() {
    if (!order) return;
    try {
      if (amountToCollect > 0) {
        await addPayment.mutateAsync({
          orderId: order.id,
          paymentType: "final",
          amount: amountToCollect,
          paymentDate: todayISO(),
          createdBy: user?.id,
        });
      }
      await completeOrder.mutateAsync(order);
      toast({
        title: "Order completed",
        description:
          amountToCollect > 0
            ? `${order.customerName} — ${formatCurrency(amountToCollect)} collected`
            : `${order.customerName}`,
        variant: "success",
      });
      handleClose();
    } catch {
      toast({ title: "Couldn't complete order", description: "Please try again.", variant: "error" });
    }
  }

  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Complete order
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-xl border border-line bg-ink/[0.02] px-4 py-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-soft">Customer</span>
              <span className="font-medium text-ink">{order.customerName}</span>
            </div>
            <div className="flex justify-between border-t border-line pt-1.5">
              <span className="text-ink-soft">Total</span>
              <span className="font-semibold text-ink">{formatCurrency(order.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-faint">Already paid</span>
              <span className="font-medium text-green-600">{formatCurrency(totalPaid)}</span>
            </div>
            <div className="flex justify-between border-t border-line pt-1.5">
              <span className="font-medium text-ink-soft">Remaining balance</span>
              <span className={`font-bold ${remaining > 0 ? "text-amber-600" : "text-green-600"}`}>
                {formatCurrency(remaining)}
              </span>
            </div>
          </div>

          {remaining > 0 && (
            <>
              <div>
                <Label htmlFor="complete-collect">Collect remaining payment</Label>
                <Input
                  id="complete-collect"
                  type="number"
                  step="0.01"
                  min="0"
                  max={remaining}
                  value={value}
                  onChange={(e) => setAmountInput(e.target.value)}
                />
                <p className="mt-1 text-xs text-ink-faint">
                  Recorded today and added to the daily cash report.
                </p>
              </div>

              {unpaidAfter > 0 && (
                <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning-bg px-3 py-2 text-xs text-warning">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    Only {formatCurrency(amountToCollect)} will be collected —{" "}
                    {formatCurrency(unpaidAfter)} will remain unpaid on this order.
                  </span>
                </div>
              )}
            </>
          )}

          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleConfirm} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {remaining > 0
                ? amountToCollect > 0
                  ? `Collect & complete`
                  : `Complete without payment`
                : "Complete order"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
