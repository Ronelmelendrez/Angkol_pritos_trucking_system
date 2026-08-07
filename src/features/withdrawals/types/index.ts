import type { BaseRecord } from "@/types";

export interface OwnerWithdrawal extends BaseRecord {
  date: string; // YYYY-MM-DD
  amount: number;
  reason?: string;
  createdBy?: string;
}

export type NewOwnerWithdrawal = Omit<OwnerWithdrawal, "id" | "createdAt" | "updatedAt">;
export type UpdateOwnerWithdrawal = Partial<Omit<OwnerWithdrawal, "id" | "createdAt" | "updatedAt">> & { id: string };
