import { SearchInput } from "@/components/ui/SearchInput";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";

interface BarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: OrderStatus | "all";
  onStatusChange: (value: OrderStatus | "all") => void;
}

const STATUS_OPTIONS: { label: string; value: OrderStatus | "all" }[] = [
  { label: "All statuses", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export function OrderFiltersBar({ search, onSearchChange, statusFilter, onStatusChange }: BarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <SearchInput placeholder="Search customer..." value={search} onChange={(e) => onSearchChange(e.target.value)} />
      <Select value={statusFilter} onValueChange={(v) => onStatusChange(v as OrderStatus | "all")}>
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
