import { SearchInput } from "@/components/ui/SearchInput";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import type { Product } from "@/features/products/types";

export type { DatePreset } from "@/components/ui/DatePresets";

interface BarProps {
  search: string;
  onSearchChange: (value: string) => void;
  productFilter: string;
  onProductChange: (value: string) => void;
  products: Product[];
}

export function SalesFiltersBar({ search, onSearchChange, productFilter, onProductChange, products }: BarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <SearchInput
        placeholder="Search..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <Select value={productFilter} onValueChange={onProductChange}>
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Product" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All products</SelectItem>
          {products.filter((p) => p.isActive).map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
