import { useState } from "react";
import { XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { useCancelOrder } from "../hooks/useOrders";
import { useToast } from "@/components/ui/useToast";

interface Props {
  orderId: string | null;
  orderNumber?: string;
  onClose: () => void;
}

export function OrderCancellationDialog({ orderId, orderNumber, onClose }: Props) {
  const [reason, setReason] = useState("");
  const cancelOrder = useCancelOrder();
  const { toast } = useToast();

  if (!orderId) return null;

  const activeOrderId = orderId;

  async function handleCancel() {
    if (!reason.trim()) return;
    try {
      await cancelOrder.mutateAsync({ id: activeOrderId, reason: reason.trim() });
      toast({ title: "Order cancelled", description: orderNumber, variant: "success" });
      setReason("");
      onClose();
    } catch {
      toast({ title: "Failed to cancel order", description: "Please try again.", variant: "error" });
    }
  }

  function handleClose() {
    setReason("");
    onClose();
  }

  return (
    <Dialog open={!!orderId} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-danger">
            <XCircle className="h-5 w-5" />
            Cancel Order
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-ink-soft">
            Are you sure you want to cancel order <span className="font-medium text-ink">{orderNumber}</span>?
            This action cannot be undone.
          </p>

          <div>
            <Label htmlFor="cancel-reason">Reason for cancellation</Label>
            <textarea
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Customer no longer needs the order"
              rows={3}
              className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary resize-none"
            />
            {!reason.trim() && (
              <p className="mt-1 text-xs text-danger">Reason is required</p>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={handleClose}>
              Keep Order
            </Button>
            <Button
              variant="destructive"
              className="flex-1 gap-1.5"
              disabled={!reason.trim() || cancelOrder.isPending}
              onClick={handleCancel}
            >
              {cancelOrder.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Cancel Order
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
