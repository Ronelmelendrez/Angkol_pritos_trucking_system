import type { Expense } from "@/types"

export type { Expense }

export interface ExpenseFormValues {
  expense_date: string
  category: string
  description: string
  amount: number
  supplier: string
  payment_method: string
}

export interface ExpenseFilters {
  startDate?: string
  endDate?: string
  category?: string
}

export interface ExpenseDailyTotal {
  expense_date: string
  total: number
}