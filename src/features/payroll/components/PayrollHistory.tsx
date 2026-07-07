import { usePayrollHistory } from "../hooks/usePayrollHistory";
import { formatCurrency } from "@/utils/currency";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";

export function PayrollHistory() {
  const { data: runs, isLoading } = usePayrollHistory();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payroll history</CardTitle>
        </CardHeader>
        <div className="space-y-2 p-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </Card>
    );
  }

  if (runs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payroll history</CardTitle>
          <CardDescription>No completed payroll runs yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const sorted = [...runs].sort((a, b) => b.periodStart.localeCompare(a.periodStart));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payroll history</CardTitle>
        <CardDescription>{runs.length} run{runs.length === 1 ? "" : "s"} completed</CardDescription>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="py-2 pr-2 font-medium">Period</th>
              <th className="py-2 pr-2 font-medium">Employee</th>
              <th className="py-2 pr-2 text-right font-medium">Hours</th>
              <th className="py-2 pr-2 text-right font-medium">Gross</th>
              <th className="py-2 pr-2 text-right font-medium">Deductions</th>
              <th className="py-2 pr-2 text-right font-medium">Net pay</th>
              <th className="py-2 pr-0 text-right font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {sorted.map((run) => {
              const deductions = run.advanceDeductions + run.loanDeductions;
              return (
                <tr key={run.id}>
                  <td className="py-2.5 pr-2 text-xs text-ink-faint">
                    {format(new Date(run.periodStart + "T00:00:00"), "MMM d")}
                    {" \u2013 "}
                    {format(new Date(run.periodEnd + "T00:00:00"), "MMM d, yy")}
                  </td>
                  <td className="py-2.5 pr-2 font-medium text-ink">{run.employeeName}</td>
                  <td className="py-2.5 pr-2 text-right text-ink-soft">{run.hoursWorked} hrs</td>
                  <td className="py-2.5 pr-2 text-right text-ink-soft">{formatCurrency(run.grossPay)}</td>
                  <td className="py-2.5 pr-2 text-right text-danger">
                    {deductions > 0 ? `-${formatCurrency(deductions)}` : "\u2014"}
                  </td>
                  <td className="py-2.5 pr-2 text-right font-semibold text-ink">{formatCurrency(run.netPay)}</td>
                  <td className="py-2.5 pr-0 text-right">
                    <Badge variant={run.status === "paid" ? "success" : "neutral"}>{run.status}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
