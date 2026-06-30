import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabaseClient"
import type { Expense } from "@/types"
import type { ExpenseFilters } from "@/features/expenses/types"

export const expensesKeys = {
  all: ["expenses"] as const,
  filtered: (filters: ExpenseFilters) => ["expenses", filters] as const,
}

async function fetchExpenses(filters: ExpenseFilters): Promise<Expense[]> {
  let query = supabase
    .from("expenses")
    .select("*")
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false })

  if (filters.startDate) {
    query = query.gte("expense_date", filters.startDate)
  }
  if (filters.endDate) {
    query = query.lte("expense_date", filters.endDate)
  }
  if (filters.category) {
    query = query.eq("category", filters.category)
  }

  const { data, error } = await query

  if (error) throw error
  return (data ?? []) as Expense[]
}

export function useExpenses(filters: ExpenseFilters = {}) {
  return useQuery({
    queryKey: expensesKeys.filtered(filters),
    queryFn: () => fetchExpenses(filters),
  })
}