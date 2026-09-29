import type { BaseRecord } from "@/types";

/** One sellable part within a conversion (e.g. Wings × 2 per base unit). */
export interface ChickenPartItem {
  id?: string;
  partName: string;
  quantityPerBase: number;
  pricePerPiece: number;
}

export interface ChickenPartConversion extends BaseRecord {
  name: string;
  baseWeightKg: number;
  isActive: boolean;
  items: ChickenPartItem[];
}

export type NewChickenPartConversion = Omit<
  ChickenPartConversion,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateChickenPartConversion = Partial<NewChickenPartConversion> & {
  id: string;
};

/** One line of a calculation result. */
export interface ConversionBreakdownRow {
  partName: string;
  quantityPerBase: number;
  pricePerPiece: number;
  totalQuantity: number;
  totalPrice: number;
}

export interface ConversionBreakdown {
  conversionName: string;
  baseWeightKg: number;
  quantity: number;
  totalWeightKg: number;
  rows: ConversionBreakdownRow[];
  totalPieces: number;
  grandTotal: number;
}
