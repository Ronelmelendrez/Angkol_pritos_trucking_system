import { useMemo, useState } from "react";
import { Pagination } from "@/components/ui/Pagination";
import { usePayrollRun, type PayrollRunDraftRow } from "../hooks/usePayrollRun";
import { PayrollRunRow } from "./PayrollRunRow";
import type { PayFrequency } from "../utils/payPeriods";

const PAGE_SIZE = 10;

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
  const [page, setPage] = useState(1);
  const allRows = usePayrollRun(referenceDate);

  const rows = useMemo(() => {
    if (!frequencyFilter) return allRows;
    return allRows.filter((r) => r.payFrequency === frequencyFilter);
  }, [allRows, frequencyFilter]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-ink-faint">No active employees to show.</p>;
  }

  return (
    <div>
      <div className="space-y-4">
        {pageRows.map((row) => (
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

      <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
