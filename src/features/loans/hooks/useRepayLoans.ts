import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"
import type { RepaymentFormSchemaOutput } from "@/utils/validators"
import { loansKeys } from "@/features/loans/hooks/useLoans"

interface RepayLoanInput {
  loanId: string
  values: RepaymentFormSchemaOutput
}

async function repayLoan({ loanId, values }: RepayLoanInput) {
  // Uses a Postgres function (see migration 0006) so the repayment insert and
  // the loan balance/status update happen atomically — avoids a race
  // condition if two repayments are recorded around the same time.
  const { data, error } = await supabase.rpc("record_loan_repayment", {
    p_loan_id: loanId,
    p_amount: values.amount,
    p_repayment_date: values.repayment_date,
    p_notes: values.notes || null,
  })

  if (error) throw error
  return data
}

export function useRepayLoan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: repayLoan,
    onSuccess: (_data, variables) => {
      toast.success("Repayment recorded")
      queryClient.invalidateQueries({ queryKey: loansKeys.all })
      queryClient.invalidateQueries({ queryKey: loansKeys.repayments(variables.loanId) })
    },
    onError: (error: Error) => {
      toast.error("Couldn't record repayment", { description: error.message })
    },
  })
}