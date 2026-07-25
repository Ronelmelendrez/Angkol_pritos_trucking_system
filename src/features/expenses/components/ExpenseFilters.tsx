import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/lib/constants";
import { SearchInput } from "@/components/ui/SearchInput";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import type { ExpenseFilters as ExpenseFiltersType } from "../types";

export type { DatePreset } from "@/components/ui/DatePresets";

interface BarProps {
  filters: ExpenseFiltersType;
  onChange: (filters: ExpenseFiltersType) => void;
}

export function ExpenseFiltersBar({ filters, onChange }: BarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <SearchInput
        placeholder="Search..."
        value={filters.search ?? ""}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
      />
      <Select
        value={filters.category ?? "All"}
        onValueChange={(v) => onChange({ ...filters, category: v as ExpenseFiltersType["category"] })}
      >
        <SelectTrigger className="w-full sm:w-36">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All categories</SelectItem>
          {EXPENSE_CATEGORIES.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.paymentMethod ?? "All"}
        onValueChange={(v) => onChange({ ...filters, paymentMethod: v as ExpenseFiltersType["paymentMethod"] })}
      >
        <SelectTrigger className="w-full sm:w-36">
          <SelectValue placeholder="Payment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All payments</SelectItem>
          {PAYMENT_METHODS.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
