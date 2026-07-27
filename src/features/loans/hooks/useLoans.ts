import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { loanRowToApp, repaymentRowToApp } from "@/lib/supabaseMappers";
import type { NewLoan, NewRepayment, Loan } from "../types";

const LOANS_KEY = ["loans"] as const;
const REPAYMENTS_KEY = ["repayments"] as const;
export const loansKeys = {
  all: LOANS_KEY,
  repayments: (loanId?: string) => ["repayments", loanId] as const,
};

export function useLoans() {
  return useQuery({
    queryKey: LOANS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loans")
        .select("*")
        .order("date_issued", { ascending: false });
      if (error) throw error;
      return data.map(loanRowToApp);
    },
  });
}

export function useRepayments() {
  return useQuery({
    queryKey: loansKeys.repayments(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("repayments")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data.map(repaymentRowToApp);
    },
  });
}

export function useAddLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewLoan) => {
      const { data, error } = await supabase
        .from("loans")
        .insert({
          employee_id: input.employeeId,
          principal: input.principal,
          remaining_balance: input.principal,
          date_issued: input.dateIssued,
          notes: input.notes ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return loanRowToApp(data);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: LOANS_KEY }),
  });
}

export function useRepayLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ loan, ...input }: NewRepayment & { loan: Loan }) => {
      // Insert the repayment record
      const { data: repaymentData, error: repayErr } = await supabase
        .from("repayments")
        .insert({
          loan_id: input.loanId,
          amount: input.amount,
          date: input.date,
        })
        .select()
        .single();
      if (repayErr) throw repayErr;

      // Update the loan balance
      const newBalance = Math.max(0, loan.remainingBalance - input.amount);
      const { error: loanErr } = await supabase
        .from("loans")
        .update({
          remaining_balance: newBalance,
          status: newBalance === 0 ? "paid" : "active",
        })
        .eq("id", loan.id);
      if (loanErr) throw loanErr;

      return repaymentRowToApp(repaymentData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: LOANS_KEY });
      queryClient.invalidateQueries({ queryKey: REPAYMENTS_KEY });
    },
  });
}
