import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useAddStockAdjustment } from "../hooks/useAddStockAdjustment";
import { todayISO } from "@/utils/date";

interface Props {
  productId: string;
  onDone?: () => void;
}

export function StockAdjustmentForm({ productId, onDone }: Props) {
  const addAdjustment = useAddStockAdjustment();
  const [date, setDate] = useState(todayISO());
  const [quantity, setQuantity] = useState(0);
  const [note, setNote] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    try {
      await addAdjustment.mutateAsync({ productId, date, quantity, note: note.trim() });
      setQuantity(0);
      setNote("");
      onDone?.();
    } catch {
      /* error handled by hook */
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="adj-date">Date</Label>
        <Input id="adj-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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
        disabled={addAdjustment.isPending || !note.trim()}
      >
        {addAdjustment.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {addAdjustment.isPending ? "Saving..." : "Record adjustment"}
      </Button>
    </form>
  );
}
