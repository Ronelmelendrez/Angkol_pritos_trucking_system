import { useState } from "react";
import { Users } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import { EmployeeCard } from "./EmployeeCard";
import type { Employee } from "../types";

const PAGE_SIZE = 12;

interface Props {
  employees: Employee[];
  isLoading: boolean;
  onSelect: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export function EmployeeList({ employees, isLoading, onSelect, onEdit, onDelete }: Props) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(employees.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = employees.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pageItems.map((emp) => (
          <EmployeeCard key={emp.id} employee={emp} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>

      <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}