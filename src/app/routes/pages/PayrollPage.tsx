import { useState, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { Clock, AlertTriangle } from "lucide-react";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { PayrollRunTable } from "@/features/payroll/components/PayrollRunTable";
import { PayrollHistory } from "@/features/payroll/components/PayrollHistory";
import { usePayPayroll } from "@/features/payroll/hooks/usePayPayroll";
import { usePayrollHistory } from "@/features/payroll/hooks/usePayrollHistory";
import { usePayrollRun } from "@/features/payroll/hooks/usePayrollRun";
import { getCurrentPeriod } from "@/features/payroll/utils/payPeriods";
import { getScheduledPayday } from "@/features/payroll/utils/paydays";
import { usePayRuleSettings } from "@/features/settings/hooks/usePayRuleSettings";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import { formatCurrency } from "@/utils/currency";
import { Badge } from "@/components/ui/Badge";
import type { PayrollRunDraftRow } from "@/features/payroll/hooks/usePayrollRun";

function PayrollContent() {
  const { data: history = [] } = usePayrollHistory();
  const { data: settings } = usePayRuleSettings();
  const { data: employees = [] } = useEmployees();
  const draftRows = usePayrollRun();

  const [selectedAdvances, setSelectedAdvances] = useState<Record<string, string[]>>({});
  const [loanDeductions, setLoanDeductions] = useState<Record<string, number>>({});
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});
  const [adjustmentNotes, setAdjustmentNotes] = useState<Record<string, string>>({});
  const [payingIds, setPayingIds] = useState<string[]>([]);

  const payPayroll = usePayPayroll();

  const handleAdvanceToggle = useCallback((employeeId: string, advanceId: string) => {
    setSelectedAdvances((prev) => {
      const current = prev[employeeId] ?? [];
      return {
        ...prev,
        [employeeId]: current.includes(advanceId) ? current.filter((id) => id !== advanceId) : [...current, advanceId],
      };
    });
  }, []);

  const handlePay = useCallback(async (row: PayrollRunDraftRow, paidAt: string) => {
    setPayingIds((prev) => [...prev, row.employeeId]);
    try {
      const currentAdj = adjustments[row.employeeId] ?? 0;
      const currentNote = adjustmentNotes[row.employeeId] ?? "";
      await payPayroll.mutateAsync({
        row: { ...row, adjustments: currentAdj, adjustmentNote: currentNote },
        advanceIds: selectedAdvances[row.employeeId] ?? [],
        loanRepayAmount: loanDeductions[row.employeeId] ?? 0,
        paidAt,
      });
      setSelectedAdvances((prev) => {
        const next = { ...prev };
        delete next[row.employeeId];
        return next;
      });
      setLoanDeductions((prev) => {
        const next = { ...prev };
        delete next[row.employeeId];
        return next;
      });
      setAdjustments((prev) => {
        const next = { ...prev };
        delete next[row.employeeId];
        return next;
      });
      setAdjustmentNotes((prev) => {
        const next = { ...prev };
        delete next[row.employeeId];
        return next;
      });
    } finally {
      setPayingIds((prev) => prev.filter((id) => id !== row.employeeId));
    }
  }, [payPayroll, selectedAdvances, loanDeductions, adjustments, adjustmentNotes]);

  const paidEmployeeIds = useMemo(() => {
    return draftRows
      .filter((row) => {
        return history.some(
          (r) =>
            r.employeeId === row.employeeId &&
            r.periodStart === row.periodStart &&
            r.periodEnd === row.periodEnd &&
            r.status === "paid",
        );
      })
      .map((r) => r.employeeId);
  }, [draftRows, history]);

  const readyRuns = useMemo(() => {
    return history
      .filter((r) => r.status === "ready")
      .sort((a, b) => a.periodStart.localeCompare(b.periodStart));
  }, [history]);

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-lg font-semibold text-char-900 md:text-xl">Payroll</h2>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-ink-faint" />
          <h3 className="text-sm font-semibold text-ink">Upcoming</h3>
        </div>
        <PayrollRunTable
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

      {readyRuns.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h3 className="text-sm font-semibold text-ink">Ready to pay</h3>
            <Badge variant="warning">{readyRuns.length} run{readyRuns.length > 1 ? "s" : ""}</Badge>
          </div>
          <div className="space-y-2">
            {readyRuns.map((run) => {
              const emp = employees.find((e) => e.id === run.employeeId);
              const freq = emp?.payFrequency ?? "semi_monthly";
              const rule = settings?.paydayRules?.find((r) => r.frequency === freq);
              const period = getCurrentPeriod(freq, new Date(run.periodStart + "T00:00:00"));
              const scheduledPayday = rule ? getScheduledPayday(period, rule) : run.periodEnd;
              const isOverdue = scheduledPayday < todayStr;
              const daysOverdue = isOverdue ? Math.ceil((new Date(todayStr).getTime() - new Date(scheduledPayday).getTime()) / (1000 * 60 * 60 * 24)) : 0;

              return (
                <div key={run.id} className="rounded-xl border border-line bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-ink">{run.employeeName}</span>
                      <p className="text-xs text-ink-faint">{format(new Date(run.periodStart + "T00:00:00"), "MMM d")} - {format(new Date(run.periodEnd + "T00:00:00"), "MMM d, yy")}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm text-ink-faint">Net pay</p>
                        <p className="font-bold text-ink">{formatCurrency(run.netPay)}</p>
                      </div>
                      {isOverdue && (
                        <Badge variant="warning">{daysOverdue}d overdue</Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
