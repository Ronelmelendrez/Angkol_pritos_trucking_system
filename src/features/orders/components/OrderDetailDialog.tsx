import { useMemo, useRef, useState } from "react";
import { Printer, Trash2, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/AlertDialog";
import { formatCurrency } from "@/utils/currency";
import { formatDate, formatTime12h, todayISO } from "@/utils/date";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useOrderPayments, useAddOrderPayment, useDeleteOrderPayment } from "../hooks/useOrderPayments";
import { useToast } from "@/components/ui/useToast";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Order, PaymentType } from "../types";

const STATUS_BADGE: Record<OrderStatus, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  deposit: "Deposit",
  final: "Final Payment",
  extra: "Extra Payment",
};

const PAYMENT_TYPE_BADGE: Record<PaymentType, string> = {
  deposit: "bg-blue-100 text-blue-700",
  final: "bg-green-100 text-green-700",
  extra: "bg-amber-100 text-amber-700",
};

interface Props {
  order: Order | null;
  onOpenChange: (open: boolean) => void;
  onComplete?: (order: Order) => void;
  onCancel?: (order: Order) => void;
}

export function OrderDetailDialog({ order, onOpenChange, onComplete, onCancel }: Props) {
  const { data: products = [] } = useProducts();
  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const slipRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [paymentType, setPaymentType] = useState<PaymentType>("deposit");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(todayISO());
  const [paymentNotes, setPaymentNotes] = useState("");
  const [deletePaymentTarget, setDeletePaymentTarget] = useState<string | null>(null);

  const { data: payments = [] } = useOrderPayments(order?.id ?? null);
  const addPayment = useAddOrderPayment();
  const deletePayment = useDeleteOrderPayment();

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingBalance = order ? order.total - totalPaid : 0;

  if (!order) return null;

  const isActive = order.status === "scheduled";

  function resetPaymentForm() {
    setPaymentType("deposit");
    setPaymentAmount("");
    setPaymentDate(todayISO());
    setPaymentNotes("");
    setShowRecordPayment(false);
  }

  async function handleRecordPayment() {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0 || !order) return;
    try {
      await addPayment.mutateAsync({
        orderId: order.id,
        paymentType,
        amount,
        paymentDate,
        notes: paymentNotes || undefined,
        createdBy: user?.id,
      });
      toast({ title: "Payment recorded", description: `${PAYMENT_TYPE_LABELS[paymentType]} — ${formatCurrency(amount)}`, variant: "success" });
      resetPaymentForm();
    } catch {
      toast({ title: "Failed to record payment", variant: "error" });
    }
  }

  async function handleDeletePayment() {
    if (!deletePaymentTarget || !order) return;
    try {
      await deletePayment.mutateAsync({ id: deletePaymentTarget, orderId: order.id });
      toast({ title: "Payment removed", variant: "default" });
    } catch {
      toast({ title: "Failed to remove payment", variant: "error" });
    } finally {
      setDeletePaymentTarget(null);
    }
  }

  function handlePrint() {
    if (!order) return;
    const content = slipRef.current;
    if (!content) return;
    const win = window.open("", "_blank", "width=400,height=600");
    if (!win) return;
    win.document.write(`
      <html><head><title>Order ${order.orderNumber}</title>
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
    <>
      <Dialog open={!!order} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {order.customerName}
              <Badge className={`text-[10px] ${STATUS_BADGE[order.status]}`}>
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              {order.orderNumber} · {formatDate(order.date)}
              {order.scheduledTime && ` · ${formatTime12h(order.scheduledTime)}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-ink-faint">Contact</p>
                <p className="font-medium text-ink">{order.contactNumber || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-ink-faint">Created</p>
                <p className="font-medium text-ink">{formatDate(order.createdAt)}</p>
              </div>
            </div>

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
            </div>

            {/* ── Payment Summary ──────────────────── */}
            <div className="rounded-xl border border-line bg-ink/[0.02] px-4 py-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-ink-soft">Total</span>
                <span className="font-bold text-ink">{formatCurrency(order.total)}</span>
              </div>
              {order.depositAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-ink-faint">Deposit</span>
                  <span className="text-blue-600">{formatCurrency(order.depositAmount)}</span>
                </div>
              )}
              {order.balanceAmount > 0 && order.balanceAmount !== order.total && (
                <div className="flex justify-between text-sm">
                  <span className="text-ink-faint">Balance</span>
                  <span className="font-medium text-ink">{formatCurrency(order.balanceAmount)}</span>
                </div>
              )}
              {payments.length > 0 && (
                <>
                  <div className="flex justify-between text-sm border-t border-line pt-1.5">
                    <span className="text-ink-faint">Paid</span>
                    <span className="font-medium text-green-600">{formatCurrency(totalPaid)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-ink-soft">Remaining</span>
                    <span className={`font-bold ${remainingBalance > 0 ? "text-amber-600" : "text-green-600"}`}>
                      {formatCurrency(remainingBalance > 0 ? remainingBalance : 0)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* ── Payment History ──────────────────── */}
            {payments.length > 0 && (
              <div className="rounded-lg border border-line bg-ink/[0.02] px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Payments</p>
                <div className="mt-2 space-y-2">
                  {payments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between gap-2 text-sm">
                      <div className="min-w-0 flex-1 flex items-center gap-2">
                        <Badge className={`text-[10px] shrink-0 ${PAYMENT_TYPE_BADGE[p.paymentType]}`}>
                          {PAYMENT_TYPE_LABELS[p.paymentType]}
                        </Badge>
                        <span className="text-ink-faint text-xs">{formatDate(p.paymentDate)}</span>
                        {p.notes && <span className="text-ink-faint text-xs truncate">· {p.notes}</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-ink">{formatCurrency(p.amount)}</span>
                        {isActive && (
                          <button
                            onClick={() => setDeletePaymentTarget(p.id)}
                            className="text-ink-faint hover:text-danger p-0.5"
                            aria-label="Remove payment"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {order.notes && (
              <div className="rounded-lg border border-line bg-ink/[0.02] px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Notes</p>
                <p className="mt-1 text-sm text-ink">{order.notes}</p>
              </div>
            )}

            {order.cancelReason && (
              <div className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-danger">Cancel Reason</p>
                <p className="mt-1 text-sm text-ink">{order.cancelReason}</p>
              </div>
            )}

            {order.updatedAt !== order.createdAt && (
              <p className="text-xs text-ink-faint text-right">Updated {formatDate(order.updatedAt)}</p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1 gap-1.5" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            {isActive && (
              <>
                <Button
                  variant="outline"
                  className="flex-1 gap-1.5"
                  onClick={() => setShowRecordPayment(true)}
                >
                  <DollarSign className="h-4 w-4" />
                  Payment
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => { onOpenChange(false); onCancel?.(order); }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => { onOpenChange(false); onComplete?.(order); }}
                >
                  Complete
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Record Payment Sub-Dialog ─────────────── */}
      <Dialog open={showRecordPayment} onOpenChange={(open) => { if (!open) resetPaymentForm(); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Payment type</Label>
              <div className="mt-1 flex gap-2">
                {(["deposit", "final", "extra"] as PaymentType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setPaymentType(t)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                      paymentType === t
                        ? "border-primary bg-primary/10 text-primary-dark"
                        : "border-line bg-surface text-ink-soft hover:bg-primary/[0.03]"
                    }`}
                  >
                    {PAYMENT_TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="pay-amount">Amount</Label>
              <Input
                id="pay-amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="pay-date">Payment date</Label>
              <Input
                id="pay-date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="pay-notes">Notes (optional)</Label>
              <Input
                id="pay-notes"
                placeholder="e.g. Cash, GCash"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={resetPaymentForm}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || addPayment.isPending}
                onClick={handleRecordPayment}
              >
                Record
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Payment Confirmation ───────────── */}
      <AlertDialog open={!!deletePaymentTarget} onOpenChange={(v) => !v && setDeletePaymentTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove payment</AlertDialogTitle>
            <AlertDialogDescription>
              Remove this payment record? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePayment}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
