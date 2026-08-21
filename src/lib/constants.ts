export const EXPENSE_CATEGORIES = [
  "Raw Materials",
  "Ingredients",
  "Cooking Supplies",
  "Packaging Materials",
  "Fuel & Energy",
  "Employee Salaries",
  "Equipment Repairs",
  "Transportation",
  "Utilities",
  "Cleaning Supplies",
  "Miscellaneous",
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const PAYMENT_METHODS = ["Cash", "GCash", "Bank Transfer", "Credit"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const EXPENSE_FUND_SOURCES = ["cash_drawer", "separate"] as const;
export type ExpenseFundSource = (typeof EXPENSE_FUND_SOURCES)[number];
export const FUND_SOURCE_LABELS: Record<ExpenseFundSource, string> = {
  cash_drawer: "Cash drawer (from sales)",
  separate: "Separate money",
};

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  "Raw Materials": "#E67E22",
  "Ingredients": "#C0392B",
  "Cooking Supplies": "#F1C40F",
  "Packaging Materials": "#8D6E63",
  "Fuel & Energy": "#6D4C41",
  "Employee Salaries": "#2ECC71",
  "Equipment Repairs": "#B8860B",
  "Transportation": "#3498DB",
  "Utilities": "#34495E",
  "Cleaning Supplies": "#1ABC9C",
  "Miscellaneous": "#9B59B6",
};

export const USER_ROLES = ["manager", "staff"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  manager: "Admin",
  staff: "Employee",
};

export const ROLE_BASE_PATH: Record<UserRole, string> = {
  manager: "/dashboard",
  staff: "/employee",
};

export const ADVANCE_STATUSES = ["pending", "deducted"] as const;
export type AdvanceStatus = (typeof ADVANCE_STATUSES)[number];

export const LOAN_STATUSES = ["active", "paid"] as const;
export type LoanStatus = (typeof LOAN_STATUSES)[number];

export const ORDER_STATUSES = ["scheduled", "completed", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
};