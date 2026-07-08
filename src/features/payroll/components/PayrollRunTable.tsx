import { useMemo } from "react";
import { usePayrollRun, type PayrollRunDraftRow } from "../hooks/usePayrollRun";
import { PayrollRunRow } from "./PayrollRunRow";
import type { PayFrequency } from "../utils/payPeriods";

interface Props {
  referenceDate: Date;
  paidEmployeeIds: string[];
  frequencyFilter?: PayFrequency;
  selectedAdvances: Record<string, string[]>;
  loanDeductions: Record<string, number>;
  adjustments: Record<string, number>;
  adjustmentNotes: Record<string, string>;
  onAdvanceToggle: (employeeId: string, advanceId: string) => void;
  onLoanDeductionChange: (employeeId: string, val: number) => void;
  onAdjustmentChange: (employeeId: string, val: number) => void;
  onAdjustmentNoteChange: (employeeId: string, note: string) => void;
  onPay: (row: PayrollRunDraftRow, paidAt: string) => void;
  payingIds: string[];
}

export function PayrollRunTable({
  referenceDate,
  paidEmployeeIds,
  selectedAdvances,
  loanDeductions,
  adjustments,
  adjustmentNotes,
  onAdvanceToggle,
  onLoanDeductionChange,
  onAdjustmentChange,
  onAdjustmentNoteChange,
  onPay,
  payingIds,
  frequencyFilter,
}: Props) {
  const allRows = usePayrollRun(referenceDate);

  const rows = useMemo(() => {
    if (!frequencyFilter) return allRows;
    return allRows.filter((r) => r.payFrequency === frequencyFilter);
  }, [allRows, frequencyFilter]);

  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-ink-faint">No active employees to show.</p>;
  }

  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <PayrollRunRow
          key={row.employeeId}
          row={row}
          selectedAdvanceIds={selectedAdvances[row.employeeId] ?? []}
          onAdvanceToggle={(id) => onAdvanceToggle(row.employeeId, id)}
          onLoanDeductionChange={(val) => onLoanDeductionChange(row.employeeId, val)}
          onAdjustmentChange={(val) => onAdjustmentChange(row.employeeId, val)}
          onAdjustmentNoteChange={(note) => onAdjustmentNoteChange(row.employeeId, note)}
          onPay={(paidAt) => onPay(row, paidAt)}
          isPaying={payingIds.includes(row.employeeId)}
          isPaid={paidEmployeeIds.includes(row.employeeId)}
        />
      ))}
    </div>
  );
}
