import { useState } from "react";
import { Eye, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/utils/currency";
import { PayslipDialog } from "./PayslipDialog";
import type { PayrollRunDraftRow } from "../hooks/usePayrollRun";

interface Props {
  row: PayrollRunDraftRow;
  selectedAdvanceIds: string[];
  onAdvanceToggle: (id: string) => void;
  onLoanDeductionChange: (val: number) => void;
  onAdjustmentChange: (val: number) => void;
  onAdjustmentNoteChange: (note: string) => void;
  onPay: () => void;
  isPaying: boolean;
  isPaid: boolean;
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
            <p className="mt-0.5 text-xs text-ink-faint">{row.hoursWorked} hrs \u00d7 {formatCurrency(row.hourlyRate)}/hr</p>
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
              <Button size="sm" onClick={onPay} disabled={isPaying}>
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
    </>
  );
}
