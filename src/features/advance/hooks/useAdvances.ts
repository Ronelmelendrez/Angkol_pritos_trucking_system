import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabaseClient"
import type { CashAdvance } from "@/types"

export const advancesKeys = {
  all: ["cash_advances"] as const,
}

async function fetchAdvances(): Promise<CashAdvance[]> {
  const { data, error } = await supabase
    .from("cash_advances")
    .select("*, employee:employee_id(id, name)")
    .order("advance_date", { ascending: false })

  if (error) throw error
  return (data ?? []) as CashAdvance[]
}

export function useAdvances() {
  return useQuery({
    queryKey: advancesKeys.all,
    queryFn: fetchAdvances,
  })
}