import { useState, useCallback } from "react";
import { subMonths } from "date-fns/subMonths";
import { addMonths } from "date-fns/addMonths";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { PayPeriodPicker } from "@/features/payroll/components/PayPeriodPicker";
import { PayrollRunTable } from "@/features/payroll/components/PayrollRunTable";
import { PayrollHistory } from "@/features/payroll/components/PayrollHistory";
import { usePayPayroll } from "@/features/payroll/hooks/usePayPayroll";
import { usePayrollHistory } from "@/features/payroll/hooks/usePayrollHistory";
import { getCurrentPeriod } from "@/features/payroll/utils/payPeriods";
import type { PayFrequency } from "@/features/payroll/utils/payPeriods";
import type { PayrollRunDraftRow } from "@/features/payroll/hooks/usePayrollRun";

function PayrollContent() {
  const [frequency, setFrequency] = useState<PayFrequency>("semi_monthly");
  const [referenceDate, setReferenceDate] = useState(new Date());

  const { data: history = [] } = usePayrollHistory();

  const paidEmployeeIds = history
    .filter((r) => {
      const period = getCurrentPeriod(frequency, referenceDate);
      return r.periodStart === period.start && r.periodEnd === period.end && r.status === "paid";
    })
    .map((r) => r.employeeId);

  const [selectedAdvances, setSelectedAdvances] = useState<Record<string, string[]>>({});
  const [loanDeductions, setLoanDeductions] = useState<Record<string, number>>({});
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});
  const [adjustmentNotes, setAdjustmentNotes] = useState<Record<string, string>>({});
  const [payingIds, setPayingIds] = useState<string[]>([]);

  const payPayroll = usePayPayroll();

  const currentPeriod = getCurrentPeriod(frequency, referenceDate);

  const handlePrev = useCallback(() => {
    setReferenceDate((d) => subMonths(d, 1));
    setSelectedAdvances({});
    setLoanDeductions({});
    setAdjustments({});
    setAdjustmentNotes({});
  }, []);

  const handleNext = useCallback(() => {
    setReferenceDate((d) => addMonths(d, 1));
    setSelectedAdvances({});
    setLoanDeductions({});
    setAdjustments({});
    setAdjustmentNotes({});
  }, []);

  const canGoNext = getCurrentPeriod(frequency, addMonths(referenceDate, 1)).end <= new Date().toISOString().slice(0, 10);

  const handleAdvanceToggle = useCallback((employeeId: string, advanceId: string) => {
    setSelectedAdvances((prev) => {
      const current = prev[employeeId] ?? [];
      return {
        ...prev,
        [employeeId]: current.includes(advanceId) ? current.filter((id) => id !== advanceId) : [...current, advanceId],
      };
    });
  }, []);

  const handlePay = useCallback(async (row: PayrollRunDraftRow) => {
    setPayingIds((prev) => [...prev, row.employeeId]);
    try {
      await payPayroll.mutateAsync({
        row,
        advanceIds: selectedAdvances[row.employeeId] ?? [],
        loanRepayAmount: loanDeductions[row.employeeId] ?? 0,
      });
    } finally {
      setPayingIds((prev) => prev.filter((id) => id !== row.employeeId));
    }
  }, [payPayroll, selectedAdvances, loanDeductions]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-char-900 md:text-xl">Payroll</h2>
        <PayPeriodPicker
          periodLabel={currentPeriod.label}
          frequency={frequency}
          onFrequencyChange={setFrequency}
          onPrev={handlePrev}
          onNext={handleNext}
          canGoNext={canGoNext}
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink">Current period</h3>
        <PayrollRunTable
          referenceDate={referenceDate}
          paidEmployeeIds={paidEmployeeIds}
          selectedAdvances={selectedAdvances}
          loanDeductions={loanDeductions}
          adjustments={adjustments}
          adjustmentNotes={adjustmentNotes}
          onAdvanceToggle={handleAdvanceToggle}
          onLoanDeductionChange={(empId, val) => setLoanDeductions((p) => ({ ...p, [empId]: val }))}
          onAdjustmentChange={(empId, val) => setAdjustments((p) => ({ ...p, [empId]: val }))}
          onAdjustmentNoteChange={(empId, note) => setAdjustmentNotes((p) => ({ ...p, [empId]: note }))}
          onPay={handlePay}
          payingIds={payingIds}
        />
      </div>

      <PayrollHistory />
    </div>
  );
}

export function PayrollPage() {
  return (
    <ErrorBoundary section="Payroll">
      <PayrollContent />
    </ErrorBoundary>
  );
}
