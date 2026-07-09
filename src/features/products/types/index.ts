import type { BaseRecord } from "@/types";

export interface Product extends BaseRecord {
  name: string;
  defaultPrice: number;
  unit: string;
  isActive: boolean;
  reorderThreshold?: number;
}

export type NewProduct = Omit<Product, "id" | "createdAt" | "updatedAt">;
export type UpdateProduct = Partial<NewProduct> & { id: string };
