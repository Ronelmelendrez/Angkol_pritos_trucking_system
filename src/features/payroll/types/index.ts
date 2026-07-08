import type { BaseRecord } from "@/types";

export interface PayrollRun extends BaseRecord {
  employeeId: string;
  periodStart: string;
  periodEnd: string;
  hoursWorked: number;
  dailyRate: number;
  grossPay: number;
  advanceDeductions: number;
  loanDeductions: number;
  adjustments: number;
  adjustmentNote?: string;
  netPay: number;
  status: "upcoming" | "ready" | "paid";
  paidAt?: string;
  advanceIds: string[];
  loanId?: string;
}

export type NewPayrollRun = Omit<PayrollRun, "id" | "createdAt" | "updatedAt">;
