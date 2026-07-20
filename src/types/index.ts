export * from "../index";/**
 * Global data-model types, mirroring the Supabase Postgres schema.
 * Feature modules import from here and extend with feature-specific
 * request/response shapes in their own `types/` folders.
 */

export type UUID = string

export interface Employee {
  id: UUID
  name: string
  phone: string | null
  hourly_rate: number
  hire_date: string // YYYY-MM-DD
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Attendance {
  id: UUID
  employee_id: UUID
  clock_in: string // ISO timestamp
  clock_out: string | null
  notes: string | null
  created_at: string
  // joined (optional, present when queried with employee relation)
  employee?: Pick<Employee, "id" | "name">
}

export interface Expense {
  id: UUID
  expense_date: string // YYYY-MM-DD
  category: string
  description: string | null
  amount: number
  supplier: string | null
  payment_method: string
  created_at: string
  updated_at: string
}

export type AdvanceStatus = "pending" | "deducted"

export interface CashAdvance {
  id: UUID
  employee_id: UUID
  amount: number
  advance_date: string // YYYY-MM-DD
  status: AdvanceStatus
  notes: string | null
  created_at: string
  employee?: Pick<Employee, "id" | "name">
}

export type LoanStatus = "active" | "paid"

export interface DailySummary {
  id: UUID
  summary_date: string // YYYY-MM-DD
  total_sales: number
  total_expenses: number
  net_profit: number
  notes: string | null
  created_at: string
  updated_at: string
}

/** Generic paginated/list response shape used by list hooks */
export interface ListResult<T> {
  data: T[]
  count: number
}