import type { BaseRecord } from "@/types";
import type { ExpenseCategory, PaymentMethod } from "@/lib/constants";

export interface Expense extends BaseRecord {
  date: string; // YYYY-MM-DD
  category: ExpenseCategory;
  description: string;
  amount: number;
  supplier?: string;
  paymentMethod: PaymentMethod;
  productId?: string;
  quantityPurchased?: number;
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