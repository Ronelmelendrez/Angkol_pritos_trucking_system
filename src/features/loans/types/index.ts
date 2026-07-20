import type { BaseRecord } from "@/types";
import type { LoanStatus } from "@/lib/constants";

export interface Loan extends BaseRecord {
  employeeId: string;
  principal: number;
  remainingBalance: number;
  dateIssued: string; // YYYY-MM-DD
  status: LoanStatus;
  notes?: string;
}

export interface Repayment extends BaseRecord {
  loanId: string;
  amount: number;
  date: string; // YYYY-MM-DD
}

export type NewLoan = Omit<
  Loan,
  "id" | "createdAt" | "updatedAt" | "remainingBalance" | "status"
>;
export type NewRepayment = Omit<Repayment, "id" | "createdAt" | "updatedAt">;