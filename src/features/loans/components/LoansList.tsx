import { useState } from "react";
import { Landmark, PhilippinePeso } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { RepaymentForm } from "./RepaymentForm";
import type { Loan } from "../types";
import type { Employee } from "@/features/employees/types";

interface Props {
  loans: Loan[];
  employees: Employee[];
  isLoading: boolean;
}

export function LoansList({ loans, employees, isLoading }: Props) {
  const [activeLoan, setActiveLoan] = useState<Loan | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (loans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line py-14 text-center">
        <Landmark className="mb-2 h-8 w-8 text-ink-faint" />
        <p className="text-sm font-medium text-ink">No loans on record</p>
      </div>
    );
  }

  const employeeName = (id: string) => employees.find((e) => e.id === id)?.name ?? "Unknown";

  return (
    <>
      <div className="space-y-3">
        {loans.map((loan) => {
          const progress = loan.principal > 0 ? 1 - loan.remainingBalance / loan.principal : 1;
          return (
            <div key={loan.id} className="ticket ticket-perf p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-ink">{employeeName(loan.employeeId)}</p>
                  <p className="text-xs text-ink-soft">
                    Issued {formatDate(loan.dateIssued)}
                    {loan.notes ? ` · ${loan.notes}` : ""}
                  </p>
                </div>
                <Badge variant={loan.status === "paid" ? "success" : "warning"}>
                  {loan.status === "paid" ? "Paid off" : "Active"}
                </Badge>
              </div>

              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-ink-soft">
                  {formatCurrency(loan.principal - loan.remainingBalance)} paid of {formatCurrency(loan.principal)}
                </span>
                <span className="font-semibold text-ink">{formatCurrency(loan.remainingBalance)} left</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-ink/[0.06]">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>

              {loan.status === "active" && (
                <Button variant="outline" size="sm" className="mt-3" onClick={() => setActiveLoan(loan)}>
                  <PhilippinePeso className="h-3.5 w-3.5" /> Record repayment
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={!!activeLoan} onOpenChange={(open) => !open && setActiveLoan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record repayment</DialogTitle>
          </DialogHeader>
          {activeLoan && <RepaymentForm loan={activeLoan} onDone={() => setActiveLoan(null)} />}
        </DialogContent>
      </Dialog>
    </>
  );
}