import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"
import type { LoanFormSchemaOutput } from "@/utils/validators"
import { loansKeys } from "@/features/loans/hooks/useLoans"

async function insertLoan(values: LoanFormSchemaOutput) {
  const { data, error } = await supabase
    .from("loans")
    .insert({
      employee_id: values.employee_id,
      principal_amount: values.principal_amount,
      remaining_balance: values.principal_amount,
      interest_rate: values.interest_rate,
      loan_date: values.loan_date,
      notes: values.notes || null,
      status: "active",
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export function useAddLoan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: insertLoan,
    onSuccess: () => {
      toast.success("Loan recorded")
      queryClient.invalidateQueries({ queryKey: loansKeys.all })
    },
    onError: (error: Error) => {
      toast.error("Couldn't record loan", { description: error.message })
    },
  })
}