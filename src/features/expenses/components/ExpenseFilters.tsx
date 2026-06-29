import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { EXPENSE_CATEGORIES } from "@/lib/constants"
import type { ExpenseFilters as ExpenseFiltersType } from "@/features/expenses/types"

interface ExpenseFiltersProps {
  filters: ExpenseFiltersType
  onChange: (filters: ExpenseFiltersType) => void
}

export function ExpenseFilters({ filters, onChange }: ExpenseFiltersProps) {
  const hasActiveFilters = Boolean(
    filters.startDate || filters.endDate || filters.category
  )

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">From</label>
        <Input
          type="date"
          className="w-40"
          value={filters.startDate ?? ""}
          onChange={(e) => onChange({ ...filters, startDate: e.target.value || undefined })}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">To</label>
        <Input
          type="date"
          className="w-40"
          value={filters.endDate ?? ""}
          onChange={(e) => onChange({ ...filters, endDate: e.target.value || undefined })}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Category</label>
        <Select
          value={filters.category ?? "all"}
          onValueChange={(value) =>
            onChange({ ...filters, category: value === "all" ? undefined : value })
          }
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {EXPENSE_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={() => onChange({})} className="gap-1">
          <X className="size-3.5" />
          Clear
        </Button>
      )}
    </div>
  )
}