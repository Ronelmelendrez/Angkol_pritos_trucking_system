import { useMemo } from "react";
import { format } from "date-fns";
import { usePayrollHistory } from "@/features/payroll/hooks/usePayrollHistory";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/utils/currency";

export function PayrollSummary() {
  const { data: runs, isLoading } = usePayrollHistory();

  const { periodLabel, rows, totalNet } = useMemo(() => {
    const paid = runs.filter((r) => r.status === "paid").sort((a, b) => b.periodStart.localeCompare(a.periodStart));
    if (paid.length === 0) return { periodLabel: null, rows: [], totalNet: 0 };

    const latestPeriod = paid[0];
    const periodRuns = paid.filter(
      (r) => r.periodStart === latestPeriod.periodStart && r.periodEnd === latestPeriod.periodEnd,
    );
    const start = new Date(latestPeriod.periodStart + "T00:00:00");
    const end = new Date(latestPeriod.periodEnd + "T00:00:00");
    const label = `${format(start, "MMM d")} \u2013 ${format(end, "MMM d, yyyy")}`;

    const net = periodRuns.reduce((s, r) => s + r.netPay, 0);
    return { periodLabel: label, rows: periodRuns, totalNet: net };
  }, [runs]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Last payroll</CardTitle>
        </CardHeader>
        <div className="space-y-2 p-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Last payroll</CardTitle>
          <CardDescription>
            {periodLabel ?? "No completed payroll runs yet"}
          </CardDescription>
        </div>
      </CardHeader>
      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-faint">No paid payroll periods yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="py-2 pr-2 font-medium">Employee</th>
                <th className="py-2 pr-2 text-right font-medium">Hours</th>
                <th className="py-2 pr-2 text-right font-medium">Gross</th>
                <th className="py-2 pr-2 text-right font-medium">Deductions</th>
                <th className="py-2 pr-0 text-right font-medium">Net pay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => {
                const deductions = r.advanceDeductions + r.loanDeductions;
                return (
                  <tr key={r.id}>
                    <td className="py-2.5 pr-2 font-medium text-ink">{r.employeeName}</td>
                    <td className="py-2.5 pr-2 text-right text-ink-soft">{r.hoursWorked} hrs</td>
                    <td className="py-2.5 pr-2 text-right text-ink-soft">{formatCurrency(r.grossPay)}</td>
                    <td className="py-2.5 pr-2 text-right text-danger">
                      {deductions > 0 ? `-${formatCurrency(deductions)}` : "\u2014"}
                    </td>
                    <td className="py-2.5 pr-0 text-right font-semibold text-ink">{formatCurrency(r.netPay)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-line">
                <td colSpan={4} className="pt-3 text-right font-medium text-ink-soft">Total payout</td>
                <td className="pt-3 text-right font-bold text-primary-dark">{formatCurrency(totalNet)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </Card>
  );
}
