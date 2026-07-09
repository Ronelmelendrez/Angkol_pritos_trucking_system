import type { BaseRecord } from "@/types";

export interface InventoryLedgerEntry {
  productId: string;
  date: string;
  openingQty: number;
  purchasedQty: number;
  soldQty: number;
  adjustmentQty: number;
  adjustmentNote?: string;
  closingQty: number;
}

export interface StockAdjustment extends BaseRecord {
  productId: string;
  date: string;
  quantity: number;
  note: string;
}
