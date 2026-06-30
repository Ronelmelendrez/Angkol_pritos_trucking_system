import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabaseClient"
import type { Loan } from "@/types"

export const loansKeys = {
  all: ["loans"] as const,
  active: ["loans", "active"] as const,
  repayments: (loanId: string) => ["loans", loanId, "repayments"] as const,
}

async function fetchLoans(): Promise<Loan[]> {
  const { data, error } = await supabase
    .from("loans")
    .select("*, employee:employee_id(id, name)")
    .order("loan_date", { ascending: false })

  if (error) throw error
  return (data ?? []) as Loan[]
}

export function useLoans() {
  return useQuery({
    queryKey: loansKeys.all,
    queryFn: fetchLoans,
  })
}