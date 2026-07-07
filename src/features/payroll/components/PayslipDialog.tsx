import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { formatCurrency } from "@/utils/currency";
import type { PayrollRunDraftRow } from "../hooks/usePayrollRun";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  row: PayrollRunDraftRow;
  advanceIds: string[];
  loanRepayAmount: number;
}

export function PayslipDialog({ open, onOpenChange, row, advanceIds, loanRepayAmount }: Props) {
  const advanceTotal = advanceIds.reduce((s, id) => {
    const a = row.pendingAdvances.find((pa) => pa.id === id);
    return s + (a?.amount ?? 0);
  }, 0);

  const netPay = Math.max(0, row.grossPay - advanceTotal - loanRepayAmount + row.adjustments);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Payslip \u2014 {row.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-faint">Period</span>
            <span className="font-medium text-ink">{row.periodLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-faint">Pay date</span>
            <span className="font-medium text-ink">{format(new Date(), "MMM d, yyyy")}</span>
          </div>
          <hr className="border-line" />
          <div className="flex justify-between">
            <span className="text-ink-faint">Hours worked</span>
            <span className="font-medium text-ink">{row.hoursWorked} hrs</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-faint">Hourly rate</span>
            <span className="font-medium text-ink">{formatCurrency(row.hourlyRate)}/hr</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-ink">Gross pay</span>
            <span className="font-semibold text-ink">{formatCurrency(row.grossPay)}</span>
          </div>
          <hr className="border-line" />
          {advanceTotal > 0 && (
            <div className="flex justify-between text-danger">
              <span>Advance deductions</span>
              <span>-{formatCurrency(advanceTotal)}</span>
            </div>
          )}
          {loanRepayAmount > 0 && (
            <div className="flex justify-between text-danger">
              <span>Loan deduction</span>
              <span>-{formatCurrency(loanRepayAmount)}</span>
            </div>
          )}
          {row.adjustments !== 0 && (
            <div className="flex justify-between" style={{ color: row.adjustments > 0 ? "var(--color-success)" : "var(--color-danger)" }}>
              <span>{row.adjustmentNote || "Adjustment"}</span>
              <span>{row.adjustments > 0 ? "+" : ""}{formatCurrency(row.adjustments)}</span>
            </div>
          )}
          <hr className="border-line" />
          <div className="flex justify-between text-base">
            <span className="font-bold text-ink">Net pay</span>
            <span className="font-bold text-primary-dark">{formatCurrency(netPay)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
