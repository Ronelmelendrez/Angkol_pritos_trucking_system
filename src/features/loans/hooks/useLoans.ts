import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { loansTable, repaymentsTable } from "@/lib/mockData";
import type { NewLoan, NewRepayment, Loan } from "../types";

const LOANS_KEY = ["loans"] as const;
const REPAYMENTS_KEY = ["repayments"] as const;

export function useLoans() {
  return useQuery({
    queryKey: LOANS_KEY,
    queryFn: () => loansTable.list(),
  });
}

export function useRepayments() {
  return useQuery({
    queryKey: REPAYMENTS_KEY,
    queryFn: () => repaymentsTable.list(),
  });
}

export function useAddLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewLoan) =>
      loansTable.create({ ...input, remainingBalance: input.principal, status: "active" }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: LOANS_KEY }),
  });
}

export function useRepayLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ loan, ...input }: NewRepayment & { loan: Loan }) => {
      const repayment = await repaymentsTable.create(input);
      const newBalance = Math.max(0, loan.remainingBalance - input.amount);
      await loansTable.update(loan.id, {
        remainingBalance: newBalance,
        status: newBalance === 0 ? "paid" : "active",
      });
      return repayment;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: LOANS_KEY });
      queryClient.invalidateQueries({ queryKey: REPAYMENTS_KEY });
    },
  });
}