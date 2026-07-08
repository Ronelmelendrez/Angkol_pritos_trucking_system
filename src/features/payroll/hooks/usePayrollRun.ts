import { useMemo } from "react";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import { useAttendance } from "@/features/attendance/hooks/useAttendance";
import { useAdvances } from "@/features/advances/hooks/useAdvances";
import { useLoans } from "@/features/loans/hooks/useLoans";
import { getCurrentPeriod, type PayFrequency } from "../utils/payPeriods";

const HOURS_PER_DAY = 8;

export interface PayrollRunDraftRow {
  employeeId: string;
  name: string;
  payFrequency: PayFrequency;
  periodStart: string;
  periodEnd: string;
  periodLabel: string;
  hoursWorked: number;
  daysWorked: number;
  dailyRate: number;
  grossPay: number;
  pendingAdvances: { id: string; amount: number; reason?: string }[];
  advanceDeductions: number;
  loanId?: string;
  loanRemaining: number;
  loanDeduction: number;
  adjustments: number;
  adjustmentNote: string;
  netPay: number;
}

export function usePayrollRun(referenceDate: Date = new Date()) {
  const { data: employees = [] } = useEmployees();
  const { data: attendance = [] } = useAttendance();
  const { data: advances = [] } = useAdvances();
  const { data: loans = [] } = useLoans();

  return useMemo(() => {
    const active = employees.filter((e) => e.isActive);
    return active.map((emp) => {
      const freq = emp.payFrequency ?? "semi_monthly";
      const period = getCurrentPeriod(freq, referenceDate);

      const periodRecords = attendance.filter(
        (a) => a.employeeId === emp.id && a.hoursWorked != null && a.date >= period.start && a.date <= period.end,
      );

      const hoursWorked = periodRecords.reduce((sum, a) => sum + (a.hoursWorked ?? 0), 0);

      const daysWorked = periodRecords.reduce((sum, a) => {
        if (a.shift === "half") return sum + 0.5;
        if (a.shift === "full") return sum + 1;
        return sum + (a.hoursWorked ?? 0) / HOURS_PER_DAY;
      }, 0);

      const grossPay = daysWorked * emp.dailyRate;

      const pendingAdvances = advances
        .filter((a) => a.employeeId === emp.id && a.status === "pending")
        .map((a) => ({ id: a.id, amount: a.amount, reason: a.reason }));

      const activeLoan = loans.find((l) => l.employeeId === emp.id && l.status === "active");

      return {
        employeeId: emp.id,
        name: emp.name,
        payFrequency: freq,
        periodStart: period.start,
        periodEnd: period.end,
        periodLabel: period.label,
        hoursWorked: Math.round(hoursWorked * 100) / 100,
        daysWorked: Math.round(daysWorked * 100) / 100,
        dailyRate: emp.dailyRate,
        grossPay,
        pendingAdvances,
        advanceDeductions: pendingAdvances.reduce((s, a) => s + a.amount, 0),
        loanId: activeLoan?.id,
        loanRemaining: activeLoan?.remainingBalance ?? 0,
        loanDeduction: 0,
        adjustments: 0,
        adjustmentNote: "",
        netPay: grossPay,
      };
    });
  }, [employees, attendance, advances, loans, referenceDate]);
}
