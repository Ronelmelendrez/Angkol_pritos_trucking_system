import { useState } from "react";
import { usePayrollHistory } from "../hooks/usePayrollHistory";
import { formatCurrency } from "@/utils/currency";
import { format } from "date-fns/format";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";

const PAGE_SIZE = 10;

export function PayrollHistory() {
  const [page, setPage] = useState(1);
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

  const paidRuns = runs.filter((r) => r.status === "paid");

  if (paidRuns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payroll history</CardTitle>
          <CardDescription>No completed payroll runs yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const sorted = [...paidRuns].sort((a, b) => b.periodStart.localeCompare(a.periodStart));

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payroll history</CardTitle>
        <CardDescription>{paidRuns.length} run{paidRuns.length === 1 ? "" : "s"} completed</CardDescription>
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
              <th className="py-2 pr-2 text-right font-medium">Pay date</th>
              <th className="py-2 pr-0 text-right font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {pageItems.map((run) => {
              const deductions = run.advanceDeductions + run.loanDeductions;
              return (
                <tr key={run.id}>
                  <td className="py-2.5 pr-2 text-xs text-ink-faint">
                    {format(new Date(run.periodStart + "T00:00:00"), "MMM d")}
                    {" - "}
                    {format(new Date(run.periodEnd + "T00:00:00"), "MMM d, yy")}
                  </td>
                  <td className="py-2.5 pr-2 font-medium text-ink">{run.employeeName}</td>
                  <td className="py-2.5 pr-2 text-right text-ink-soft">{run.hoursWorked} hrs</td>
                  <td className="py-2.5 pr-2 text-right text-ink-soft">{formatCurrency(run.grossPay)}</td>
                  <td className="py-2.5 pr-2 text-right text-danger">
                    {deductions > 0 ? `-${formatCurrency(deductions)}` : "\u2014"}
                  </td>
                  <td className="py-2.5 pr-2 text-right font-semibold text-ink">{formatCurrency(run.netPay)}</td>
                  <td className="py-2.5 pr-2 text-right text-ink-soft">
                    {run.paidAt ? format(new Date(run.paidAt + "T00:00:00"), "MMM d, yy") : "\u2014"}
                  </td>
                  <td className="py-2.5 pr-0 text-right">
                    <Badge variant="success">Paid</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 pb-4">
        <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </Card>
  );
}
