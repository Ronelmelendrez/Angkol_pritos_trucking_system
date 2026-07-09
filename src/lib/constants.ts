export const EXPENSE_CATEGORIES = [
  "Raw Chicken",
  "Lechon Manok",
  "Oil",
  "Spices",
  "Packaging",
  "Fuel",
  "Repairs",
  "Misc",
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const PAYMENT_METHODS = ["Cash", "GCash", "Bank Transfer", "Credit"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  "Raw Chicken": "#E67E22",
  "Lechon Manok": "#C0392B",
  Oil: "#F1C40F",
  Spices: "#D35400",
  Packaging: "#8D6E63",
  Fuel: "#6D4C41",
  Repairs: "#B8860B",
  Misc: "#A08D86",
};

export const STOCK_CATEGORIES = ["Raw Chicken", "Lechon Manok"] as const;
export type StockCategory = (typeof STOCK_CATEGORIES)[number];

export function isStockCategory(category: string): category is StockCategory {
  return STOCK_CATEGORIES.includes(category as StockCategory);
}

export const USER_ROLES = ["manager", "staff"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ADVANCE_STATUSES = ["pending", "deducted"] as const;
export type AdvanceStatus = (typeof ADVANCE_STATUSES)[number];

export const LOAN_STATUSES = ["active", "paid"] as const;
export type LoanStatus = (typeof LOAN_STATUSES)[number];

/** Simulated network latency for mock services, in ms */
export const MOCK_LATENCY = 350;

/** Manual daily sales figure until POS integration exists */
export const DEFAULT_DAILY_SALES = 18500;