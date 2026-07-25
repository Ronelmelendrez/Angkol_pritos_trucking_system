import { SearchInput } from "@/components/ui/SearchInput";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import type { AttendanceStatus, ShiftType } from "../types";
import type { Employee } from "@/features/employees/types";

export interface AttendanceFilters {
  search: string;
  employeeId: string;
  status: AttendanceStatus | "all";
  shift: ShiftType | "all";
}

interface Props {
  filters: AttendanceFilters;
  onChange: (filters: AttendanceFilters) => void;
  employees: Employee[];
}

export function AttendanceFiltersBar({ filters, onChange, employees }: Props) {
  const activeEmployees = employees.filter((e) => e.isActive);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <SearchInput
        placeholder="Search employee..."
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
      />
      <Select
        value={filters.employeeId}
        onValueChange={(v) => onChange({ ...filters, employeeId: v })}
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Employee" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All employees</SelectItem>
          {activeEmployees.map((e) => (
            <SelectItem key={e.id} value={e.id}>
              {e.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.status}
        onValueChange={(v) => onChange({ ...filters, status: v as AttendanceFilters["status"] })}
      >
        <SelectTrigger className="w-full sm:w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All status</SelectItem>
          <SelectItem value="present">Present</SelectItem>
          <SelectItem value="absent">Absent</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.shift}
        onValueChange={(v) => onChange({ ...filters, shift: v as AttendanceFilters["shift"] })}
      >
        <SelectTrigger className="w-full sm:w-32">
          <SelectValue placeholder="Shift" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All shifts</SelectItem>
          <SelectItem value="full">Full day</SelectItem>
          <SelectItem value="half">Half day</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
