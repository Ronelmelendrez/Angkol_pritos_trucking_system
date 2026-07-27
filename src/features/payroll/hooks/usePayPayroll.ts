import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { getCategoryIdByName } from "@/lib/categories";
import { useToast } from "@/components/ui/useToast";
import type { PayrollRunDraftRow } from "./usePayrollRun";

const PAYROLL_KEY = ["payroll_runs"] as const;
const EXPENSES_KEY = ["expenses"] as const;

export function usePayPayroll() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      row,
      advanceIds,
      loanRepayAmount,
      paidAt,
    }: {
      row: PayrollRunDraftRow;
      advanceIds: string[];
      loanRepayAmount: number;
      paidAt: string;
    }) => {
      const advanceTotal = advanceIds.reduce((s, id) => {
        const a = row.pendingAdvances.find((pa) => pa.id === id);
        return s + (a?.amount ?? 0);
      }, 0);

      const netPay = row.grossPay - advanceTotal - loanRepayAmount + row.adjustments;

      // Resolve Salaries category UUID
      const salariesCategoryId = await getCategoryIdByName("Salaries");

      // Single atomic RPC — handles:
      //   1. payroll_runs insert
      //   2. cash_advances → status = 'deducted'
      //   3. loans → remaining_balance update + repayments insert
      //   4. expenses insert (salary payout)
      const { error } = await supabase.rpc("pay_payroll_run", {
        p_employee_id: row.employeeId,
        p_period_start: row.periodStart,
        p_period_end: row.periodEnd,
        p_hours_worked: row.hoursWorked,
        p_daily_rate: row.dailyRate,
        p_gross_pay: row.grossPay,
        p_advance_ids: advanceIds,
        p_advance_deductions: advanceTotal,
        p_loan_id: row.loanIds.length > 0 && loanRepayAmount > 0 ? row.loanIds[0] : null,
        p_loan_deduction: loanRepayAmount,
        p_adjustments: row.adjustments,
        p_adjustment_note: row.adjustmentNote || null,
        p_net_pay: Math.max(0, netPay),
        p_paid_at: paidAt,
        p_salaries_category_id: salariesCategoryId,
      });

      if (error) throw error;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PAYROLL_KEY });
      queryClient.invalidateQueries({ queryKey: EXPENSES_KEY });
    },
    onError: () => {
      toast({
        title: "Payroll save failed",
        description: "Could not mark period as paid.",
        variant: "error",
      });
    },
    onSuccess: () => {
      toast({
        title: "Payroll saved",
        description: "Period marked as paid.",
        variant: "success",
      });
    },
  });
}
