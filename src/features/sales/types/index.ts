import type { BaseRecord } from "@/types";

export interface Sale extends BaseRecord {
  date: string;
  productId: string;
  quantitySold: number;
  unitPrice: number;
  amount: number;
  notes?: string;
  /** Set when this sale was derived from a completed scheduled order */
  orderId?: string;
  branchId: string;
}

export type NewSale = Omit<Sale, "id" | "createdAt" | "updatedAt">;
export type UpdateSale = Partial<NewSale> & { id: string };
