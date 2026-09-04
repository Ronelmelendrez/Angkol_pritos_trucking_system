import type { BaseRecord } from "@/types";
import type { ExpenseCategory, PaymentMethod, ExpenseFundSource } from "@/lib/constants";

export interface ExpenseItem {
  productId: string;
  quantityPurchased: number;
}

export interface Expense extends BaseRecord {
  date: string; // YYYY-MM-DD
  category: ExpenseCategory;
  description: string;
  amount: number;
  branchId?: string;
  supplier?: string;
  paymentMethod: PaymentMethod;
  fundSource?: ExpenseFundSource;
  productId?: string;
  quantityPurchased?: number;
  items?: ExpenseItem[];
  createdBy?: string;
}

export type NewExpense = Omit<Expense, "id" | "createdAt" | "updatedAt">;
export type UpdateExpense = Partial<NewExpense> & { id: string };

export interface ExpenseFilters {
  category?: ExpenseCategory | "All";
  paymentMethod?: PaymentMethod | "All";
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}