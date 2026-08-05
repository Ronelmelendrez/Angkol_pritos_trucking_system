import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { useAddStockAdjustment } from "../hooks/useAddStockAdjustment";
import { ADJUSTMENT_REASONS, REASON_META } from "../utils/reasonMeta";
import type { AdjustmentReason } from "../types";
import { todayISO } from "@/utils/date";

interface Props {
  productId: string;
  onDone?: () => void;
}

export function StockAdjustmentForm({ productId, onDone }: Props) {
  const addAdjustment = useAddStockAdjustment();
  const [date, setDate] = useState(todayISO());
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState<AdjustmentReason>("other");
  const [note, setNote] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (quantity === 0) return;
    try {
      await addAdjustment.mutateAsync({ productId, date, quantity, reason, note: note.trim() });
      setQuantity(0);
      setReason("other");
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
            (positive = found extra, negative = loss)
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
        <Label htmlFor="adj-reason">Reason</Label>
        <Select value={reason} onValueChange={(v) => setReason(v as AdjustmentReason)}>
          <SelectTrigger id="adj-reason">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ADJUSTMENT_REASONS.map((r) => (
              <SelectItem key={r} value={r}>
                {REASON_META[r].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="adj-note">Note (optional)</Label>
        <Input
          id="adj-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. 2 trays left out overnight"
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={addAdjustment.isPending || quantity === 0}
      >
        {addAdjustment.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {addAdjustment.isPending ? "Saving..." : "Record adjustment"}
      </Button>
    </form>
  );
}
