import { useState, useCallback } from "react";
import { Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useSetStock, useCurrentStock } from "../hooks/useEditStock";
import { todayISO } from "@/utils/date";
import { formatQty } from "@/utils/currency";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
}

function EditStockForm({
  productId,
  onDone,
}: {
  productId: string;
  onDone: () => void;
}) {
  const { data: products = [] } = useProducts();
  const product = products.find((p) => p.id === productId);
  const currentStock = useCurrentStock(productId);
  const setStock = useSetStock();

  const [targetQty, setTargetQty] = useState(currentStock?.closingQty ?? 0);
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState("");

  const currentQty = currentStock?.closingQty ?? 0;
  const delta = targetQty - currentQty;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (delta === 0) return;
    try {
      await setStock.mutateAsync({
        productId,
        date,
        targetQty,
        currentQty,
        note: note.trim() || `Set stock to ${targetQty} ${product?.unit ?? ""}`,
      });
      onDone();
    } catch {
      /* error handled by hook */
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Pencil className="h-5 w-5" />
          Edit stock — {product?.name ?? "Product"}
        </DialogTitle>
        <DialogDescription>
          Set the stock to a specific quantity. An adjustment will be created for the difference.
        </DialogDescription>
      </DialogHeader>

      <div className="rounded-lg bg-ink/3 px-4 py-3 text-sm">
        <p className="text-ink-faint">Current stock</p>
        <p className="text-lg font-bold text-ink">
          {formatQty(currentQty)}{" "}
          <span className="text-sm font-normal text-ink-faint">{product?.unit}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="target-qty">New stock quantity</Label>
          <Input
            id="target-qty"
            type="number"
            step="0.01"
            min="0"
            value={targetQty}
            onChange={(e) => setTargetQty(parseFloat(e.target.value) || 0)}
          />
          {delta !== 0 && (
            <p className={`mt-1 text-xs font-medium ${delta > 0 ? "text-success" : "text-danger"}`}>
              {delta > 0 ? "+" : ""}{formatQty(delta)} {product?.unit} will be{" "}
              {delta > 0 ? "added" : "removed"}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="edit-date">Date</Label>
          <Input
            id="edit-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="edit-note">Note (optional)</Label>
          <Input
            id="edit-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Physical count correction"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={setStock.isPending || delta === 0}
        >
          {setStock.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {setStock.isPending ? "Saving..." : delta === 0 ? "No change needed" : "Update stock"}
        </Button>
      </form>
    </>
  );
}

export function EditStockDialog({ open, onOpenChange, productId }: Props) {
  const [formKey, setFormKey] = useState(0);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) setFormKey((k) => k + 1);
      onOpenChange(nextOpen);
    },
    [onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <EditStockForm key={formKey} productId={productId} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
