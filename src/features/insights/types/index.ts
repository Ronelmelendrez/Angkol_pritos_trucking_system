import type { Sale } from "@/features/sales/types";
import type { Expense } from "@/features/expenses/types";
import type { AttendanceRecord } from "@/features/attendance/types";
import type { Employee } from "@/features/employees/types";
import type { Product } from "@/features/products/types";
import type { CashAdvance } from "@/features/advances/types";
import type { Loan } from "@/features/loans/types";
import type { PayrollRow } from "@/features/reports/types";
import type { ProductStockInfo } from "@/features/inventory/hooks/useAllProductStock";
import type { AdjustmentWithProduct } from "@/features/inventory/hooks/useAdjustmentsLog";

export type InsightTone = "positive" | "warning" | "neutral";

export type InsightCategory =
  | "sales"
  | "expenses"
  | "profit"
  | "attendance"
  | "inventory"
  | "payroll"
  | "cashflow";

export interface Insight {
  id: string;
  title: string;
  message: string;
  tone: InsightTone;
  category: InsightCategory;
  link?: string;
  /** Lower = shown first. Warnings are intentionally ranked ahead of positives. */
  priority: number;
}

export interface InsightsData {
  sales: Sale[];
  expenses: Expense[];
  attendance: AttendanceRecord[];
  employees: Employee[];
  products: Product[];
  advances: CashAdvance[];
  loans: Loan[];
  payroll: PayrollRow[];
  stock: ProductStockInfo[];
  adjustments: AdjustmentWithProduct[];
  prevPeriodSales: number;
  prevPeriodExpenses: number;
  defaultReorderThreshold: number;
}
