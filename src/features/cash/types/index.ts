import type { BaseRecord } from "@/types";

export interface CashOpening extends BaseRecord {
  date: string; // YYYY-MM-DD
  openingCash: number;
  branchId: string;
  createdBy?: string;
}

export type NewCashOpening = Omit<CashOpening, "id" | "createdAt" | "updatedAt">;

export interface CashCount extends BaseRecord {
  date: string; // YYYY-MM-DD
  expectedCash: number;
  actualCash: number;
  difference: number;
  branchId: string;
  remarks?: string;
  countedBy?: string;
}

export type NewCashCount = Omit<CashCount, "id" | "createdAt" | "updatedAt">;

export type CashMovementType = "opening" | "sale" | "expense" | "advance" | "withdrawal" | "order_deposit";

export interface CashMovementItem {
  id: string;
  time: string; // ISO timestamp, used for ordering + display
  type: CashMovementType;
  label: string;
  /** Signed: positive = cash in, negative = cash out */
  amount: number;
  /** Running drawer balance after this event */
  balance: number;
}

export interface DailyCashData {
  date: string;
  openingCash: number | null;
  cashSales: number;
  orderDeposits: number;
  /** Balance/final/extra order payments collected this day */
  orderBalancePayments: number;
  cashExpenses: number;
  cashAdvances: number;
  ownerWithdrawals: number;
  otherIncome: number;
  totalCashIn: number;
  totalCashOut: number;
  expectedCash: number;
  cashCount: CashCount | null;
  actualCash: number | null;
  difference: number | null;
  movements: CashMovementItem[];
}

export interface CashOpeningFormValues {
  date: string;
  openingCash: number;
}

export interface CashCountFormValues {
  date: string;
  actualCash: number;
  remarks: string;
}
