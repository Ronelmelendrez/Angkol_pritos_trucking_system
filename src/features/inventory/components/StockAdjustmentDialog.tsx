import { useState } from "react";
import { Loader2, ArrowUpDown } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useAddStockAdjustment } from "../hooks/useAddStockAdjustment";
import { todayISO } from "@/utils/date";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialProductId?: string;
}

export function StockAdjustmentDialog({ open, onOpenChange, initialProductId }: Props) {
  const { data: products = [] } = useProducts();
  const activeProducts = products.filter((p) => p.isActive);
  const addAdjustment = useAddStockAdjustment();

  const [productId, setProductId] = useState(initialProductId ?? "");
  const [date, setDate] = useState(todayISO());
  const [quantity, setQuantity] = useState(0);
  const [note, setNote] = useState("");

  function reset() {
    setProductId(initialProductId ?? "");
    setDate(todayISO());
    setQuantity(0);
    setNote("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productId || !note.trim() || quantity === 0) return;
    try {
      await addAdjustment.mutateAsync({ productId, date, quantity, note: note.trim() });
      reset();
      onOpenChange(false);
    } catch {
      /* error handled by hook */
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Stock adjustment
          </DialogTitle>
          <DialogDescription>
            Add or remove stock manually (spoilage, waste, recount, etc.)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Product</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {activeProducts.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="adj-date">Date</Label>
            <Input
              id="adj-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="adj-qty">
              Quantity{" "}
              <span className="text-xs text-ink-faint">
                (positive = found extra, negative = spoilage/waste)
              </span>
            </Label>
            <Input
              id="adj-qty"
              type="number"
              step="0.01"
              value={quantity || ""}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              placeholder="0"
            />
          </div>

          <div>
            <Label htmlFor="adj-note">Reason (required)</Label>
            <Input
              id="adj-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Spoiled meat, recount found 2kg extra"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={addAdjustment.isPending || !note.trim() || !productId || quantity === 0}
          >
            {addAdjustment.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {addAdjustment.isPending ? "Saving..." : "Record adjustment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
