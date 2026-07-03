import { Users } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmployeeCard } from "./EmployeeCard";
import type { Employee } from "../types";

interface Props {
  employees: Employee[];
  isLoading: boolean;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export function EmployeeList({ employees, isLoading, onEdit, onDelete }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line py-14 text-center">
        <Users className="mb-2 h-8 w-8 text-ink-faint" />
        <p className="text-sm font-medium text-ink">No crew members yet</p>
        <p className="text-xs text-ink-faint">Add your first employee to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {employees.map((emp) => (
        <EmployeeCard key={emp.id} employee={emp} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}