import { useMemo } from "react";
import { Phone, Wallet, Calendar, Clock, CircleDollarSign, Landmark, History, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAttendance } from "@/features/attendance/hooks/useAttendance";
import { useAdvances } from "@/features/advances/hooks/useAdvances";
import { useLoans, useRepayments } from "@/features/loans/hooks/useLoans";
import { usePayrollHistory } from "@/features/payroll/hooks/usePayrollHistory";
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
  const { data: loans = [] } = useLoans();
  const { data: repayments = [] } = useRepayments();
  const { data: payrollRuns = [] } = usePayrollHistory();

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

  const employeeLoans = useMemo(
    () =>
      loans
        .filter((l) => l.employeeId === employee?.id)
        .sort((a, b) => b.dateIssued.localeCompare(a.dateIssued)),
    [loans, employee?.id],
  );

  const employeePayrollRuns = useMemo(
    () =>
      payrollRuns
        .filter((r) => r.employeeId === employee?.id && r.status === "paid")
        .sort((a, b) => b.periodStart.localeCompare(a.periodStart))
        .slice(0, 10),
    [payrollRuns, employee?.id],
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
                      {record.shift && (
                        <Badge variant={record.shift === "half" ? "warning" : "success"}>
                          {record.shift === "half" ? "Half" : "Full"}
                        </Badge>
                      )}
                      <span className="text-ink-soft">
                        {record.clockIn ? formatTime(record.clockIn) : "—"}
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

            <div className="mt-2">
              <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink">
                <Landmark className="h-4 w-4 text-ink-faint" />
                Loans
              </div>
              {employeeLoans.length === 0 ? (
                <p className="text-sm text-ink-faint">No loans recorded.</p>
              ) : (
                <div className="divide-y divide-dashed divide-line rounded-lg border border-line">
                  {employeeLoans.map((loan) => {
                    const loanRepayments = repayments
                      .filter((r) => r.loanId === loan.id)
                      .sort((a, b) => b.date.localeCompare(a.date));
                    const paid = loan.principal - loan.remainingBalance;
                    const progress = loan.principal > 0 ? paid / loan.principal : 1;
                    return (
                      <div key={loan.id} className="px-4 py-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-ink">{formatDate(loan.dateIssued)}</span>
                          <Badge variant={loan.status === "paid" ? "success" : "warning"}>
                            {loan.status === "paid" ? "Paid off" : "Active"}
                          </Badge>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-xs text-ink-soft">
                          <span>{formatCurrency(paid)} paid of {formatCurrency(loan.principal)}</span>
                          <span className="font-medium text-ink">{formatCurrency(loan.remainingBalance)} left</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink/6">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${Math.round(progress * 100)}%` }}
                          />
                        </div>
                        {loanRepayments.length > 0 && (
                          <div className="mt-1.5 space-y-0.5">
                            {loanRepayments.slice(0, 3).map((r) => (
                              <div key={r.id} className="flex justify-between text-xs text-ink-faint">
                                <span>{formatDate(r.date)}</span>
                                <span>{formatCurrency(r.amount)}</span>
                              </div>
                            ))}
                            {loanRepayments.length > 3 && (
                              <p className="text-xs text-ink-faint">+{loanRepayments.length - 3} more repayments</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-2">
              <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink">
                <History className="h-4 w-4 text-ink-faint" />
                Payroll history
              </div>
              {employeePayrollRuns.length === 0 ? (
                <p className="text-sm text-ink-faint">No payroll records yet.</p>
              ) : (
                <div className="divide-y divide-dashed divide-line rounded-lg border border-line">
                  {employeePayrollRuns.map((run) => (
                    <div key={run.id} className="flex items-center justify-between px-4 py-2 text-sm">
                      <span className="text-ink">
                        {formatDate(run.periodStart)} — {formatDate(run.periodEnd)}
                      </span>
                      <div className="flex items-center gap-3">
                        {(run.advanceDeductions + run.loanDeductions) > 0 && (
                          <span className="text-xs text-danger">
                            -{formatCurrency(run.advanceDeductions + run.loanDeductions)}
                          </span>
                        )}
                        <span className="font-bold text-primary-dark">{formatCurrency(run.netPay)}</span>
                      </div>
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
