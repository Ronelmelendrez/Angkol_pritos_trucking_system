import { useState } from "react";
import { Eye, CheckCircle2, CheckCircle, XCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { PayslipDialog } from "./PayslipDialog";
import { PayConfirmationDialog } from "./PayConfirmationDialog";
import type { PayrollRunDraftRow } from "../hooks/usePayrollRun";

interface Props {
  row: PayrollRunDraftRow;
  selectedAdvanceIds: string[];
  onAdvanceToggle: (id: string) => void;
  onLoanDeductionChange: (val: number) => void;
  onAdjustmentChange: (val: number) => void;
  onAdjustmentNoteChange: (note: string) => void;
  onPay: (paidAt: string) => void;
  isPaying: boolean;
  isPaid: boolean;
}

function periodDays(periodStart: string, periodEnd: string) {
  const start = new Date(periodStart + "T00:00:00");
  const end = new Date(periodEnd + "T00:00:00");
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export function PayrollRunRow({
  row,
  selectedAdvanceIds,
  onAdvanceToggle,
  onLoanDeductionChange,
  onAdjustmentChange,
  onAdjustmentNoteChange,
  onPay,
  isPaying,
  isPaid,
}: Props) {
  const [showPayslip, setShowPayslip] = useState(false);
  const [showConfirmPay, setShowConfirmPay] = useState(false);

  const advanceTotal = selectedAdvanceIds.reduce((s, id) => {
    const a = row.pendingAdvances.find((pa) => pa.id === id);
    return s + (a?.amount ?? 0);
  }, 0);

  const netPay = Math.max(0, row.grossPay - advanceTotal - row.loanDeduction + row.adjustments);

  return (
    <>
      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-ink">{row.name}</span>
              <Badge variant="neutral">{row.payFrequency === "semi_monthly" ? "Semi-monthly" : row.payFrequency === "weekly" ? "Weekly" : "Monthly"}</Badge>
            </div>
            <div className="mt-0.5 flex items-center gap-3 text-xs text-ink-faint">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(row.periodStart)} — {formatDate(row.periodEnd)}
              </span>
              <span>·</span>
              <span>{row.daysWorked} / {periodDays(row.periodStart, row.periodEnd)} days</span>
              <span>·</span>
              <span>{formatCurrency(row.dailyRate)}/day</span>
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-success">
                <CheckCircle className="h-3 w-3" />
                {row.presentCount} present
              </span>
              <span className="flex items-center gap-1 text-danger">
                <XCircle className="h-3 w-3" />
                {row.absentCount} absent
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-ink-faint">Gross</p>
            <p className="font-bold text-ink">{formatCurrency(row.grossPay)}</p>
          </div>
        </div>

        {!isPaid && (
          <div className="mt-4 space-y-3">
            {row.pendingAdvances.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium text-ink-faint">Pending advances to deduct</p>
                <div className="space-y-1">
                  {row.pendingAdvances.map((a) => (
                    <label key={a.id} className="flex cursor-pointer items-center gap-2 text-sm">
                      <Checkbox
                        checked={selectedAdvanceIds.includes(a.id)}
                        onCheckedChange={() => onAdvanceToggle(a.id)}
                      />
                      <span>{formatCurrency(a.amount)}{a.reason ? ` \u2014 ${a.reason}` : ""}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {row.loanRemaining > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium text-ink-faint">Loan deduction (balance: {formatCurrency(row.loanRemaining)})</p>
                <Input
                  type="number"
                  min="0"
                  max={row.loanRemaining}
                  step="0.01"
                  value={row.loanDeduction || ""}
                  onChange={(e) => onLoanDeductionChange(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="h-8 w-32"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-1 text-xs font-medium text-ink-faint">Adjustment (+/-)</p>
                <Input
                  type="number"
                  step="0.01"
                  value={row.adjustments || ""}
                  onChange={(e) => onAdjustmentChange(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="h-8 w-full"
                />
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-ink-faint">Note</p>
                <Input
                  value={row.adjustmentNote}
                  onChange={(e) => onAdjustmentNoteChange(e.target.value)}
                  placeholder="e.g. Bonus"
                  className="h-8 w-full"
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
          <div>
            <span className="text-sm text-ink-faint">Net pay: </span>
            <span className="text-lg font-bold text-primary-dark">{formatCurrency(netPay)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowPayslip(true)}>
              <Eye className="h-4 w-4" /> Payslip
            </Button>
            {isPaid ? (
              <Badge variant="success">Paid</Badge>
            ) : (
              <Button size="sm" onClick={() => setShowConfirmPay(true)} disabled={isPaying}>
                <CheckCircle2 className="h-4 w-4" /> {isPaying ? "Saving..." : "Mark as paid"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <PayslipDialog
        open={showPayslip}
        onOpenChange={setShowPayslip}
        row={row}
        advanceIds={selectedAdvanceIds}
        loanRepayAmount={row.loanDeduction}
      />
      <PayConfirmationDialog
        open={showConfirmPay}
        onOpenChange={setShowConfirmPay}
        row={row}
        onConfirm={(paidAt) => {
          onPay(paidAt);
          setShowConfirmPay(false);
        }}
        isPaying={isPaying}
      />
    </>
  );
}
