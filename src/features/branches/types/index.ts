import type { BaseRecord } from "@/types";

export interface Branch extends BaseRecord {
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
  staffEmail?: string;
}

export type NewBranch = Omit<Branch, "id" | "createdAt" | "updatedAt" | "staffEmail">;
export type UpdateBranch = Partial<NewBranch> & { id: string };