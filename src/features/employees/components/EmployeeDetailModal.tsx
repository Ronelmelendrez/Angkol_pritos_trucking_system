import { useMemo } from "react";
import { Phone, Wallet, Calendar, Clock, CircleDollarSign, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAttendance } from "@/features/attendance/hooks/useAttendance";
import { useAdvances } from "@/features/advances/hooks/useAdvances";
import { formatCurrency } from "@/utils/currency";
import { formatDate, formatTime } from "@/utils/date";
import { cn } from "@/utils/cn";
import type { Employee } from "../types";

interface Props {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (employee: Employee) => void;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function EmployeeDetailModal({ employee, open, onOpenChange, onEdit }: Props) {
  const { data: attendance = [] } = useAttendance();
  const { data: advances = [] } = useAdvances();

  const employeeAttendance = useMemo(
    () =>
      attendance
        .filter((a) => a.employeeId === employee?.id)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 10),
    [attendance, employee?.id],
  );

  const employeeAdvances = useMemo(
    () =>
      advances
        .filter((a) => a.employeeId === employee?.id)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 10),
    [advances, employee?.id],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        {employee && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold text-white"
                  style={{ backgroundColor: employee.avatarColor }}
                >
                  {initials(employee.name)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <DialogTitle>{employee.name}</DialogTitle>
                    <Badge variant={employee.isActive ? "success" : "neutral"}>
                      {employee.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-ink-soft">Crew member since {formatDate(employee.hireDate)}</p>
                </div>
                {onEdit && (
                  <Button variant="ghost" size="icon" className="ml-auto h-8 w-8 shrink-0 text-ink-faint" onClick={() => { onEdit(employee); onOpenChange(false); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </DialogHeader>

            <div className="grid gap-3 sm:grid-cols-3">
              <Card className="p-3.5">
                <div className="flex items-center gap-1.5 text-xs text-ink-soft mb-1">
                  <Phone className="h-3.5 w-3.5" />
                  Phone
                </div>
                <p className="text-sm font-medium text-ink">{employee.phone}</p>
              </Card>
              <Card className="p-3.5">
                <div className="flex items-center gap-1.5 text-xs text-ink-soft mb-1">
                  <Wallet className="h-3.5 w-3.5" />
                  Rate
                </div>
                <p className="text-sm font-medium text-ink">{formatCurrency(employee.dailyRate)}/day</p>
              </Card>
              <Card className="p-3.5">
                <div className="flex items-center gap-1.5 text-xs text-ink-soft mb-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Hired
                </div>
                <p className="text-sm font-medium text-ink">{formatDate(employee.hireDate)}</p>
              </Card>
            </div>

            <div className="mt-2">
              <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink">
                <Clock className="h-4 w-4 text-ink-faint" />
                Recent attendance
              </div>
              {employeeAttendance.length === 0 ? (
                <p className="text-sm text-ink-faint">No attendance records yet.</p>
              ) : (
                <div className="divide-y divide-dashed divide-line rounded-lg border border-line">
                  {employeeAttendance.map((record) => (
                    <div key={record.id} className="flex items-center justify-between px-4 py-2 text-sm">
                      <span className="text-ink">{formatDate(record.date)}</span>
                      <span className="text-ink-soft">
                        {formatTime(record.clockIn)}
                        {record.clockOut ? ` — ${formatTime(record.clockOut)}` : " (clocked in)"}
                      </span>
                      <span className={cn("font-medium", record.hoursWorked ? "text-ink" : "text-warning")}>
                        {record.hoursWorked ? `${record.hoursWorked.toFixed(1)}h` : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-2">
              <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink">
                <CircleDollarSign className="h-4 w-4 text-ink-faint" />
                Cash advances
              </div>
              {employeeAdvances.length === 0 ? (
                <p className="text-sm text-ink-faint">No advances recorded.</p>
              ) : (
                <div className="divide-y divide-dashed divide-line rounded-lg border border-line">
                  {employeeAdvances.map((advance) => (
                    <div key={advance.id} className="flex items-center justify-between px-4 py-2 text-sm">
                      <span className="text-ink">{formatDate(advance.date)}</span>
                      <span className="font-medium text-ink">{formatCurrency(advance.amount)}</span>
                      <Badge variant={advance.status === "deducted" ? "success" : "warning"} className="capitalize">
                        {advance.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
