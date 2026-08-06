import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { DatePresets, type DatePreset } from "@/components/ui/DatePresets";
import { useProducts } from "@/features/products/hooks/useProducts";
import { formatCurrency } from "@/utils/currency";

interface Props {
  selectedProductId: string;
  onProductChange: (id: string) => void;
  datePreset: DatePreset;
  onDatePresetChange: (preset: DatePreset) => void;
  customFrom: string;
  customTo: string;
  onCustomFromChange: (value: string) => void;
  onCustomToChange: (value: string) => void;
  showProduct?: boolean;
}

export function InventoryFilters({
  selectedProductId,
  onProductChange,
  datePreset,
  onDatePresetChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
  showProduct = true,
}: Props) {
  const { data: products = [] } = useProducts();
  const activeProducts = products.filter((p) => p.isActive);

  return (
    <div className="flex flex-wrap items-end gap-4 p-4 pb-0">
      {showProduct && (
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
      )}
      <div>
        <Label className="text-xs text-ink-faint">Period</Label>
        <div className="mt-1">
          <DatePresets
            value={datePreset}
            onChange={onDatePresetChange}
            customFrom={customFrom}
            customTo={customTo}
            onCustomFromChange={onCustomFromChange}
            onCustomToChange={onCustomToChange}
          />
        </div>
      </div>
    </div>
  );
}
