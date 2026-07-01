import type { BaseRecord } from "@/types";
import type { AdvanceStatus } from "@/lib/constants";

export interface CashAdvance extends BaseRecord {
  employeeId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  status: AdvanceStatus;
  reason?: string;
}

export type NewCashAdvance = Omit<CashAdvance, "id" | "createdAt" | "updatedAt" | "status">;