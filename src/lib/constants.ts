/**
 * App-wide constants. Keep these in sync with the CHECK constraints
 * in the SQL schema (see /supabase/migrations).
 */

export const EXPENSE_CATEGORIES = [
  "Raw Chicken",
  "Lechon Manok",
  "Oil",
  "Spices",
  "Packaging",
  "Fuel",
  "Repairs",
  "Misc",
] as const

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]

export const PAYMENT_METHODS = ["Cash", "GCash", "Bank Transfer", "Credit"] as const

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const ADVANCE_STATUSES = ["pending", "deducted"] as const
export type AdvanceStatus = (typeof ADVANCE_STATUSES)[number]

export const LOAN_STATUSES = ["active", "paid"] as const
export type LoanStatus = (typeof LOAN_STATUSES)[number]

/** Category -> Tailwind-safe color token, used for chart segments + badges */
export const CATEGORY_COLORS: Record<string, string> = {
  "Raw Chicken": "#E67E22",
  "Lechon Manok": "#C0392B",
  Oil: "#F1C40F",
  Spices: "#A8540C",
  Packaging: "#8D6E63",
  Fuel: "#5D4037",
  Repairs: "#4C8C4A",
  Misc: "#C8B8AE",
}