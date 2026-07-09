import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { useProducts } from "@/features/products/hooks/useProducts";
import { formatCurrency } from "@/utils/currency";

interface Props {
  selectedProductId: string;
  onProductChange: (id: string) => void;
  rangePreset: "7d" | "14d" | "30d";
  onDateRangeChange: (range: "7d" | "14d" | "30d") => void;
}

const RANGE_LABELS: Record<string, string> = {
  "7d": "Last 7 days",
  "14d": "Last 14 days",
  "30d": "Last 30 days",
};

export function InventoryFilters({ selectedProductId, onProductChange, rangePreset, onDateRangeChange }: Props) {
  const { data: products = [] } = useProducts();
  const activeProducts = products.filter((p) => p.isActive);

  return (
    <div className="flex flex-wrap items-end gap-4 p-4 pb-0">
      <div className="min-w-48 flex-1">
        <Label htmlFor="inv-product">Product</Label>
        <div className="mt-1">
          <Select value={selectedProductId} onValueChange={onProductChange}>
            <SelectTrigger id="inv-product">
              <SelectValue placeholder="Choose a product" />
            </SelectTrigger>
            <SelectContent>
              {activeProducts.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} — {formatCurrency(p.defaultPrice)}/{p.unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label className="text-xs text-ink-faint">Period</Label>
        <div className="mt-1 flex gap-1">
          {(["7d", "14d", "30d"] as const).map((preset) => (
            <Button
              key={preset}
              variant={rangePreset === preset ? "default" : "outline"}
              size="sm"
              onClick={() => onDateRangeChange(preset)}
            >
              {RANGE_LABELS[preset]}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
