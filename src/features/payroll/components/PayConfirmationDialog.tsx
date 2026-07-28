import { useState } from "react";
import { format } from "date-fns/format";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/AlertDialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { formatCurrency } from "@/utils/currency";
import { todayISO } from "@/utils/date";
import { usePayRuleSettings } from "@/features/settings/hooks/usePayRuleSettings";
import { getScheduledPayday } from "../utils/paydays";
import { getCurrentPeriod } from "../utils/payPeriods";
import type { PayrollRunDraftRow } from "../hooks/usePayrollRun";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  row: PayrollRunDraftRow;
  advanceIds: string[];
  loanRepayAmount: number;
  currentAdjustment: number;
  onConfirm: (paidAt: string) => void;
  isPaying: boolean;
}

export function PayConfirmationDialog({ open, onOpenChange, row, advanceIds, loanRepayAmount, currentAdjustment, onConfirm, isPaying }: Props) {
  const advanceTotal = advanceIds.reduce((s, id) => {
    const a = row.pendingAdvances.find((pa) => pa.id === id);
    return s + (a?.amount ?? 0);
  }, 0);

  const netPay = Math.max(0, row.grossPay - advanceTotal - loanRepayAmount + currentAdjustment);
  const { data: settings } = usePayRuleSettings();
  const period = getCurrentPeriod(row.payFrequency, new Date(row.periodStart + "T00:00:00"));

  const rule = settings?.paydayRules?.find((r) => r.frequency === row.payFrequency);
  const scheduledPayday = rule ? getScheduledPayday(period, rule) : row.periodEnd;

  const [paidAt, setPaidAt] = useState(scheduledPayday);

  const today = todayISO();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Mark as paid</AlertDialogTitle>
          <AlertDialogDescription>
            Confirm payment for <span className="font-medium text-ink">{row.name}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-faint">Period</span>
            <span className="font-medium text-ink">{row.periodLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-faint">Scheduled payday</span>
            <span className="font-medium text-ink">{format(new Date(scheduledPayday + "T00:00:00"), "MMM d, yyyy")}</span>
          </div>
          {scheduledPayday < today && (
            <p className="text-xs text-warning">This payday was {format(new Date(scheduledPayday + "T00:00:00"), "MMM d")} — {Math.ceil((new Date(today).getTime() - new Date(scheduledPayday + "T00:00:00").getTime()) / (1000 * 60 * 60 * 24))} days ago</p>
          )}
          <div className="flex justify-between">
            <span className="text-ink-faint">Gross pay</span>
            <span className="text-ink">{formatCurrency(row.grossPay)}</span>
          </div>
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
          {currentAdjustment !== 0 && (
            <div className="flex justify-between" style={{ color: currentAdjustment > 0 ? "var(--color-success)" : "var(--color-danger)" }}>
              <span>Adjustment</span>
              <span>{currentAdjustment > 0 ? "+" : ""}{formatCurrency(currentAdjustment)}</span>
            </div>
          )}
          <hr className="border-line" />
          <div className="flex justify-between">
            <span className="font-semibold text-ink">Net pay</span>
            <span className="font-semibold text-primary-dark">{formatCurrency(netPay)}</span>
          </div>
          <div>
            <Label htmlFor="paidAt">Actual pay date</Label>
            <Input id="paidAt" type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} className="mt-1" />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPaying}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={isPaying || !paidAt} onClick={() => onConfirm(paidAt)}>
            {isPaying ? "Saving..." : `Confirm payment — ${formatCurrency(netPay)}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
