import type { BaseRecord } from "@/types";

export interface Sale extends BaseRecord {
  date: string;
  expenseId?: string;
  description: string;
  quantitySold?: number;
  amount: number;
}

export type NewSale = Omit<Sale, "id" | "createdAt" | "updatedAt">;
export type UpdateSale = Partial<NewSale> & { id: string };
