import type { BaseRecord } from "@/types";

export interface PayrollRun extends BaseRecord {
  employeeId: string;
  periodStart: string;
  periodEnd: string;
  hoursWorked: number;
  hourlyRate: number;
  grossPay: number;
  advanceDeductions: number;
  loanDeductions: number;
  adjustments: number;
  adjustmentNote?: string;
  netPay: number;
  status: "draft" | "paid";
  paidAt?: string;
  advanceIds: string[];
  loanId?: string;
}

export type NewPayrollRun = Omit<PayrollRun, "id" | "createdAt" | "updatedAt">;
