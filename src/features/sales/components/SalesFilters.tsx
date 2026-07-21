import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import type { Product } from "@/features/products/types";

export type DatePreset = "today" | "this-week" | "this-month" | "custom";

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
      <div className="relative w-full sm:w-48">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <Input
          placeholder="Search..."
          className="pl-9"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
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

interface DateProps {
  datePreset: DatePreset;
  onPresetChange: (preset: DatePreset) => void;
  customFrom: string;
  customTo: string;
  onCustomFromChange: (value: string) => void;
  onCustomToChange: (value: string) => void;
}

export function SalesDatePresets({ datePreset, onPresetChange, customFrom, customTo, onCustomFromChange, onCustomToChange }: DateProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex gap-1">
        {(["today", "this-week", "this-month"] as const).map((p) => (
          <Button
            key={p}
            variant={datePreset === p ? "default" : "outline"}
            size="sm"
            onClick={() => onPresetChange(p)}
          >
            {p === "today" ? "Today" : p === "this-week" ? "This week" : "This month"}
          </Button>
        ))}
      </div>
      {datePreset === "custom" ? (
        <div className="flex items-center gap-2">
          <Input
            type="date"
            className="w-36"
            value={customFrom}
            onChange={(e) => onCustomFromChange(e.target.value)}
          />
          <span className="text-xs text-ink-faint">–</span>
          <Input
            type="date"
            className="w-36"
            value={customTo}
            onChange={(e) => onCustomToChange(e.target.value)}
          />
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => onPresetChange("custom")}>
          Custom range
        </Button>
      )}
    </div>
  );
}
