import { format } from "date-fns";
import { CheckCircle, XCircle, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import type { PayrollRunDraftRow } from "../hooks/usePayrollRun";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  row: PayrollRunDraftRow;
  advanceIds: string[];
  loanRepayAmount: number;
  currentAdjustment: number;
  currentAdjustmentNote: string;
}

export function PayslipDialog({ open, onOpenChange, row, advanceIds, loanRepayAmount, currentAdjustment, currentAdjustmentNote }: Props) {
  const advanceTotal = advanceIds.reduce((s, id) => {
    const a = row.pendingAdvances.find((pa) => pa.id === id);
    return s + (a?.amount ?? 0);
  }, 0);

  const netPay = Math.max(0, row.grossPay - advanceTotal - loanRepayAmount + currentAdjustment);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Payslip — {row.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-faint">Period</span>
            <span className="font-medium text-ink">{row.periodLabel}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-ink-faint">Date range</span>
            <span className="flex items-center gap-1 font-medium text-ink">
              <Calendar className="h-3 w-3" />
              {formatDate(row.periodStart)} — {formatDate(row.periodEnd)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-faint">Pay date</span>
            <span className="font-medium text-ink">{format(new Date(), "MMM d, yyyy")}</span>
          </div>
          <hr className="border-line" />
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-xs text-success">
              <CheckCircle className="h-3 w-3" />
              {row.presentCount} present
            </span>
            <span className="flex items-center gap-1 text-xs text-danger">
              <XCircle className="h-3 w-3" />
              {row.absentCount} absent
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-faint">Days worked</span>
            <span className="font-medium text-ink">{row.daysWorked} days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-faint">Daily rate</span>
            <span className="font-medium text-ink">{formatCurrency(row.dailyRate)}/day</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-faint">Gross pay</span>
            <span className="font-medium text-ink">{formatCurrency(row.grossPay)}</span>
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
          {row.loanRemaining > 0 && loanRepayAmount > 0 && (
            <div className="flex justify-between text-xs text-ink-faint">
              <span>Remaining loan balance</span>
              <span>{formatCurrency(row.loanRemaining - loanRepayAmount)}</span>
            </div>
          )}
          {currentAdjustment !== 0 && (
            <div className="flex justify-between" style={{ color: currentAdjustment > 0 ? "var(--color-success)" : "var(--color-danger)" }}>
              <span>{currentAdjustmentNote || "Adjustment"}</span>
              <span>{currentAdjustment > 0 ? "+" : ""}{formatCurrency(currentAdjustment)}</span>
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
