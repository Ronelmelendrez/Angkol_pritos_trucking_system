import { Phone, Wallet, Calendar, MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/DropdownMenu";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import type { Employee } from "../types";

interface Props {
  employee: Employee;
  onSelect: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function EmployeeCard({ employee, onSelect, onEdit, onDelete }: Props) {
  return (
    <Card
      className="ticket-hover ticket-perf cursor-pointer"
      onClick={() => onSelect(employee)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: employee.avatarColor }}
          >
            {initials(employee.name)}
          </div>
          <div>
            <p className="stamp font-semibold text-ink">{employee.name}</p>
            <Badge variant={employee.isActive ? "success" : "neutral"} className="mt-0.5">
              {employee.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-ink-faint">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onEdit(employee)}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(employee)} className="text-danger">
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm text-ink-soft">
        <div className="flex items-center gap-2">
          <Phone className="h-3.5 w-3.5 text-ink-faint" /> {employee.phone}
        </div>
        <div className="flex items-center gap-2">
          <Wallet className="h-3.5 w-3.5 text-ink-faint" /> {formatCurrency(employee.dailyRate)}/day
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-ink-faint" /> Hired {formatDate(employee.hireDate)}
        </div>
      </div>
    </Card>
  );
}