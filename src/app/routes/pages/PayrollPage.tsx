import { useState, useCallback, useMemo, useEffect } from "react";
import { subMonths } from "date-fns/subMonths";
import { addMonths } from "date-fns/addMonths";
import { addWeeks } from "date-fns/addWeeks";
import { format } from "date-fns/format";
import { Clock, AlertTriangle } from "lucide-react";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { PayPeriodPicker } from "@/features/payroll/components/PayPeriodPicker";
import { PayrollRunTable } from "@/features/payroll/components/PayrollRunTable";
import { PayrollHistory } from "@/features/payroll/components/PayrollHistory";
import { usePayPayroll } from "@/features/payroll/hooks/usePayPayroll";
import { usePayrollHistory } from "@/features/payroll/hooks/usePayrollHistory";
import { getCurrentPeriod } from "@/features/payroll/utils/payPeriods";
import { getScheduledPayday } from "@/features/payroll/utils/paydays";
import { usePayRuleSettings } from "@/features/settings/hooks/usePayRuleSettings";
import { formatCurrency } from "@/utils/currency";
import { Badge } from "@/components/ui/Badge";
import type { PayFrequency, PayFrequencyFilter } from "@/features/payroll/utils/payPeriods";
import type { PayrollRunDraftRow } from "@/features/payroll/hooks/usePayrollRun";

function PayrollContent() {
  const [frequency, setFrequency] = useState<PayFrequencyFilter>("semi_monthly");
  const [referenceDate, setReferenceDate] = useState(() => {
    try {
      const saved = sessionStorage.getItem("payrollReferenceDate");
      if (saved) return new Date(saved);
    } catch {
      /* empty */
    }
    return new Date();
  });

  useEffect(() => {
    try {
      sessionStorage.setItem("payrollReferenceDate", referenceDate.toISOString());
    } catch {
      /* empty */
    }
  }, [referenceDate]);
  const isAll = frequency === "all";

  const { data: history = [] } = usePayrollHistory();
  const { data: settings } = usePayRuleSettings();

  const [selectedAdvances, setSelectedAdvances] = useState<Record<string, string[]>>({});
  const [loanDeductions, setLoanDeductions] = useState<Record<string, number>>({});
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});
  const [adjustmentNotes, setAdjustmentNotes] = useState<Record<string, string>>({});
  const [payingIds, setPayingIds] = useState<string[]>([]);

  const payPayroll = usePayPayroll();

  const advanceDate = useCallback((d: Date, dir: 1 | -1, freq: PayFrequency) => {
    const day = d.getDate();
    const month = d.getMonth();
    const year = d.getFullYear();
    if (freq === "weekly") return dir === 1 ? addWeeks(d, 1) : addWeeks(d, -1);
    if (freq === "semi_monthly") {
      if (dir === 1) {
        if (day <= 15) return new Date(year, month, 25);
        return new Date(year, month + 1, 8);
      }
      if (day <= 15) return new Date(year, month - 1, 25);
      return new Date(year, month, 8);
    }
    return dir === 1 ? addMonths(d, 1) : subMonths(d, 1);
  }, []);

  const handlePrev = useCallback(() => {
    setReferenceDate((d) => advanceDate(d, -1, frequency === "all" ? "monthly" : (frequency as PayFrequency)));
    setSelectedAdvances({});
    setLoanDeductions({});
    setAdjustments({});
    setAdjustmentNotes({});
  }, [advanceDate, frequency]);

  const handleNext = useCallback(() => {
    setReferenceDate((d) => advanceDate(d, 1, frequency === "all" ? "monthly" : (frequency as PayFrequency)));
    setSelectedAdvances({});
    setLoanDeductions({});
    setAdjustments({});
    setAdjustmentNotes({});
  }, [advanceDate, frequency]);

  const canGoNext = !isAll && getCurrentPeriod(frequency as PayFrequency, advanceDate(referenceDate, 1, frequency as PayFrequency)).end <= new Date().toISOString().slice(0, 10);

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
      await payPayroll.mutateAsync({
        row,
        advanceIds: selectedAdvances[row.employeeId] ?? [],
        loanRepayAmount: loanDeductions[row.employeeId] ?? 0,
        paidAt,
      });
      setSelectedAdvances({});
      setLoanDeductions({});
      setAdjustments({});
      setAdjustmentNotes({});
      setReferenceDate((d) => advanceDate(d, 1, row.payFrequency));
    } finally {
      setPayingIds((prev) => prev.filter((id) => id !== row.employeeId));
    }
  }, [payPayroll, selectedAdvances, loanDeductions, advanceDate]);

  const currentPeriod = !isAll ? getCurrentPeriod(frequency, referenceDate) : null;

  const paidEmployeeIds = useMemo(() => {
    if (isAll) return [];
    const period = currentPeriod!;
    return history
      .filter((r) => r.periodStart === period.start && r.periodEnd === period.end && r.status === "paid")
      .map((r) => r.employeeId);
  }, [history, isAll, currentPeriod]);

  const readyRuns = useMemo(() => {
    return history
      .filter((r) => r.status === "ready")
      .sort((a, b) => a.periodStart.localeCompare(b.periodStart));
  }, [history]);

  const todayStr = new Date().toISOString().slice(0, 10);

  const FREQ_LABELS: Record<string, string> = {
    weekly: "Weekly",
    semi_monthly: "Semi-monthly",
    monthly: "Monthly",
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-char-900 md:text-xl">Payroll</h2>
        <PayPeriodPicker
          periodLabel={currentPeriod?.label ?? ""}
          frequency={frequency}
          onFrequencyChange={setFrequency}
          onPrev={handlePrev}
          onNext={handleNext}
          canGoNext={canGoNext}
        />
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-ink-faint" />
          <h3 className="text-sm font-semibold text-ink">Upcoming</h3>
          {!isAll && <Badge variant="neutral">{FREQ_LABELS[frequency]} period</Badge>}
        </div>
        <PayrollRunTable
          referenceDate={referenceDate}
          paidEmployeeIds={paidEmployeeIds}
          frequencyFilter={isAll ? undefined : (frequency as PayFrequency)}
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
              const rule = settings?.paydayRules?.find((r) => r.frequency === "semi_monthly");
              const period = getCurrentPeriod("semi_monthly", new Date(run.periodStart + "T00:00:00"));
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
