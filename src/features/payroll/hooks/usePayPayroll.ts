import { useMutation, useQueryClient } from "@tanstack/react-query";
import { expensesTable, payrollRunsTable, loansTable } from "@/lib/mockData";
import { useMarkAdvanceDeducted } from "@/features/advances/hooks/useAdvances";
import { useRepayLoan } from "@/features/loans/hooks/useLoans";
import { useToast } from "@/components/ui/useToast";
import type { PayrollRunDraftRow } from "./usePayrollRun";

const PAYROLL_KEY = ["payroll_runs"] as const;
const EXPENSES_KEY = ["expenses"] as const;

export function usePayPayroll() {
  const queryClient = useQueryClient();
  const markAdvanceDeducted = useMarkAdvanceDeducted();
  const repayLoan = useRepayLoan();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ row, advanceIds, loanRepayAmount, paidAt }: { row: PayrollRunDraftRow; advanceIds: string[]; loanRepayAmount: number; paidAt: string }) => {
      const advanceTotal = advanceIds.reduce((s, id) => {
        const a = row.pendingAdvances.find((pa) => pa.id === id);
        return s + (a?.amount ?? 0);
      }, 0);

      const netPay = row.grossPay - advanceTotal - loanRepayAmount + row.adjustments;

      await payrollRunsTable.create({
        employeeId: row.employeeId,
        periodStart: row.periodStart,
        periodEnd: row.periodEnd,
        hoursWorked: row.hoursWorked,
        dailyRate: row.dailyRate,
        grossPay: row.grossPay,
        advanceDeductions: advanceTotal,
        loanDeductions: loanRepayAmount,
        adjustments: row.adjustments,
        adjustmentNote: row.adjustmentNote || undefined,
        netPay: Math.max(0, netPay),
        status: "paid",
        paidAt,
        advanceIds,
        ...(row.loanIds.length > 0 && loanRepayAmount > 0 ? { loanId: row.loanIds[0] } : {}),
      });

      await expensesTable.create({
        date: paidAt,
        category: "Salaries",
        description: `Payroll — ${row.name} (${row.periodStart} to ${row.periodEnd})`,
        amount: row.grossPay,
        paymentMethod: "Cash",
      });

      for (const id of advanceIds) {
        await markAdvanceDeducted.mutateAsync(id);
      }

      if (row.loanIds.length > 0 && loanRepayAmount > 0) {
        const loans = loansTable.list();
        let remaining = loanRepayAmount;
        for (const lid of row.loanIds) {
          if (remaining <= 0) break;
          const loan = loans.find((l) => l.id === lid);
          if (loan && loan.remainingBalance > 0) {
            const amount = Math.min(remaining, loan.remainingBalance);
            await repayLoan.mutateAsync({ loan, loanId: loan.id, amount, date: new Date().toISOString().slice(0, 10) });
            remaining -= amount;
          }
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PAYROLL_KEY });
      queryClient.invalidateQueries({ queryKey: EXPENSES_KEY });
    },
    onError: () => {
      toast({ title: "Payroll save failed", description: "Could not mark period as paid.", variant: "error" });
    },
    onSuccess: () => {
      toast({ title: "Payroll saved", description: "Period marked as paid.", variant: "success" });
    },
  });
}
