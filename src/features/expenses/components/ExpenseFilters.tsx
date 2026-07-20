import { Search } from "lucide-react";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/lib/constants";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import type { ExpenseFilters as ExpenseFiltersType } from "../types";

export type DatePreset = "today" | "this-week" | "this-month" | "custom";

interface BarProps {
  filters: ExpenseFiltersType;
  onChange: (filters: ExpenseFiltersType) => void;
}

export function ExpenseFiltersBar({ filters, onChange }: BarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative w-full sm:w-48">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <Input
          placeholder="Search..."
          className="pl-9"
          value={filters.search ?? ""}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </div>
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

interface DateProps {
  filters: ExpenseFiltersType;
  onChange: (filters: ExpenseFiltersType) => void;
  datePreset: DatePreset;
  onPresetChange: (preset: DatePreset) => void;
}

export function ExpenseDatePresets({ filters, onChange, datePreset, onPresetChange }: DateProps) {
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
            value={filters.dateFrom ?? ""}
            onChange={(e) => onChange({ ...filters, dateFrom: e.target.value || undefined })}
          />
          <span className="text-xs text-ink-faint">–</span>
          <Input
            type="date"
            className="w-36"
            value={filters.dateTo ?? ""}
            onChange={(e) => onChange({ ...filters, dateTo: e.target.value || undefined })}
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