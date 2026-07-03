import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/utils/currency";
import type { PayrollRow } from "../types";

export function PayrollSummary({ rows }: { rows: PayrollRow[] }) {
  const totalNet = rows.reduce((sum, r) => sum + r.netPay, 0);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Payroll summary</CardTitle>
          <CardDescription>Hours × rate, minus pending cash advances</CardDescription>
        </div>
      </CardHeader>
      {rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-faint">No active employees to pay out.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="py-2 pr-2 font-medium">Employee</th>
                <th className="py-2 pr-2 text-right font-medium">Hours</th>
                <th className="py-2 pr-2 text-right font-medium">Gross</th>
                <th className="py-2 pr-2 text-right font-medium">Advances</th>
                <th className="py-2 pr-0 text-right font-medium">Net pay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.employeeId}>
                  <td className="py-2.5 pr-2 font-medium text-ink">{r.name}</td>
                  <td className="py-2.5 pr-2 text-right text-ink-soft">{r.hoursWorked} hrs</td>
                  <td className="py-2.5 pr-2 text-right text-ink-soft">{formatCurrency(r.grossPay)}</td>
                  <td className="py-2.5 pr-2 text-right text-danger">
                    {r.pendingAdvances > 0 ? `-${formatCurrency(r.pendingAdvances)}` : "—"}
                  </td>
                  <td className="py-2.5 pr-0 text-right font-semibold text-ink">{formatCurrency(r.netPay)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-line">
                <td colSpan={4} className="pt-3 text-right font-medium text-ink-soft">
                  Total payout
                </td>
                <td className="pt-3 text-right font-bold text-primary-dark">{formatCurrency(totalNet)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </Card>
  );
}