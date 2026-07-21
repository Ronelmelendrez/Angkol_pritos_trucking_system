import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
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

interface BatchItem {
  productId: string;
  quantity: number;
  note: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BatchStockEntryForm({ open, onOpenChange }: Props) {
  const { data: products = [] } = useProducts();
  const activeProducts = products.filter((p) => p.isActive);
  const addAdjustment = useAddStockAdjustment();

  const [date, setDate] = useState(todayISO());
  const [items, setItems] = useState<BatchItem[]>([
    { productId: "", quantity: 0, note: "" },
  ]);

  function reset() {
    setDate(todayISO());
    setItems([{ productId: "", quantity: 0, note: "" }]);
  }

  function addItem() {
    setItems((prev) => [...prev, { productId: "", quantity: 0, note: "" }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateItem(index: number, patch: Partial<BatchItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  const isValid =
    date &&
    items.length > 0 &&
    items.every((item) => item.productId && item.quantity > 0 && item.note.trim());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    try {
      for (const item of items) {
        await addAdjustment.mutateAsync({
          productId: item.productId,
          date,
          quantity: item.quantity,
          note: item.note.trim(),
        });
      }
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Batch stock entry</DialogTitle>
          <DialogDescription>
            Record incoming stock for multiple products at once.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="batch-date">Date</Label>
            <Input
              id="batch-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label>Products</Label>
            {items.map((item, index) => (
              
                <div key={index} className="flex items-end gap-2">
                  <div className="flex-1">
                    {index === 0 && <Label className="mb-1.5 text-xs">Product</Label>}
                    <Select
                      value={item.productId}
                      onValueChange={(v) => updateItem(index, { productId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
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
                  <div className="w-24">
                    {index === 0 && <Label className="mb-1.5 text-xs">Qty</Label>}
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0"
                      value={item.quantity || ""}
                      onChange={(e) =>
                        updateItem(index, { quantity: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="flex-1">
                    {index === 0 && <Label className="mb-1.5 text-xs">Reason</Label>}
                    <Input
                      placeholder="e.g. Delivery received"
                      value={item.note}
                      onChange={(e) => updateItem(index, { note: e.target.value })}
                    />
                  </div>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 text-ink-faint hover:text-danger"
                      onClick={() => removeItem(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
          </div>

          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Add product
          </Button>

          <Button type="submit" className="w-full" size="lg" disabled={addAdjustment.isPending || !isValid}>
            {addAdjustment.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {addAdjustment.isPending
              ? `Saving ${items.length} adjustment${items.length > 1 ? "s" : ""}...`
              : `Record ${items.length} adjustment${items.length > 1 ? "s" : ""}`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
