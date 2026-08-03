import { useMemo } from "react";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import { useAttendance } from "@/features/attendance/hooks/useAttendance";
import { useAdvances } from "@/features/advances/hooks/useAdvances";
import { useLoans } from "@/features/loans/hooks/useLoans";
import { usePayRuleSettings, useAllEmployeePayOverrides } from "@/features/settings/hooks/usePayRuleSettings";
import { resolvePayRules, computeGrossPay } from "@/features/settings/utils/resolvePayRules";
import { getCurrentPeriod, getNextPeriod, type PayFrequency, type PayPeriod } from "../utils/payPeriods";
import { usePayrollHistory } from "./usePayrollHistory";
import type { Employee } from "@/features/employees/types";
import type { AttendanceRecord } from "@/features/attendance/types";
import type { CashAdvance } from "@/features/advances/types";
import type { Loan } from "@/features/loans/types";
import type { PayRuleSettings, EmployeePayOverride } from "@/features/settings/types";

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
  loanIds: string[];
  loanRemaining: number;
  loanDeduction: number;
  adjustments: number;
  adjustmentNote: string;
  netPay: number;
  presentCount: number;
  absentCount: number;
}

export interface PaidRunRef {
  employeeId: string;
  periodEnd: string;
  status: string;
}

function getEmployeePeriod(
  freq: PayFrequency,
  employeeId: string,
  paidRuns: PaidRunRef[],
): PayPeriod {
  const lastPaid = paidRuns
    .filter((r) => r.employeeId === employeeId && r.status === "paid")
    .sort((a, b) => b.periodEnd.localeCompare(a.periodEnd))[0];

  if (lastPaid) {
    return getNextPeriod(freq, lastPaid.periodEnd);
  }
  return getCurrentPeriod(freq);
}

export function buildDraftRow(
  emp: Employee,
  attendance: AttendanceRecord[],
  advances: CashAdvance[],
  loans: Loan[],
  globalSettings: PayRuleSettings,
  allOverrides: EmployeePayOverride[],
  paidRuns: PaidRunRef[],
): PayrollRunDraftRow {
  const freq = emp.payFrequency ?? "semi_monthly";
  const period = getEmployeePeriod(freq, emp.id, paidRuns);

  const periodRecords = attendance.filter(
    (a) => a.employeeId === emp.id && a.date >= period.start && a.date <= period.end,
  );

  const recordsWithHours = periodRecords.filter((a) => a.hoursWorked != null);
  const hoursWorked = recordsWithHours.reduce((sum, a) => sum + (a.hoursWorked ?? 0), 0);

  const presentCount = periodRecords.filter(
    (a) => a.status === "present" || (!a.status && a.clockIn),
  ).length;
  const absentCount = periodRecords.filter((a) => a.status === "absent").length;

  const override = allOverrides.find((o) => o.employeeId === emp.id);
  const rules = resolvePayRules(globalSettings, override);

  const grossPayInputs = recordsWithHours.map((a) => ({
    hoursWorked: a.hoursWorked ?? 0,
    shift: a.shift,
    clockIn: a.clockIn,
    clockOut: a.clockOut,
  }));

  const grossPay = computeGrossPay(grossPayInputs, emp.dailyRate, rules);

  const daysWorked = recordsWithHours.reduce((sum, a) => {
    if (a.shift === "half") return sum + 0.5;
    if (a.shift === "full") return sum + 1;
    return sum + (a.hoursWorked ?? 0) / rules.standardHoursPerDay;
  }, 0);

  const pendingAdvances = advances
    .filter((a) => a.employeeId === emp.id && a.status === "pending")
    .map((a) => ({ id: a.id, amount: a.amount, reason: a.reason }));

  const activeLoans = loans.filter((l) => l.employeeId === emp.id && l.status === "active");
  const loanIds = activeLoans.map((l) => l.id);
  const loanRemaining = activeLoans.reduce((s, l) => s + l.remainingBalance, 0);

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
    loanIds,
    loanRemaining,
    loanDeduction: 0,
    adjustments: 0,
    adjustmentNote: "",
    netPay: grossPay,
    presentCount,
    absentCount,
  };
}

export function usePayrollRun() {
  const { data: employees = [] } = useEmployees();
  const { data: attendance = [] } = useAttendance();
  const { data: advances = [] } = useAdvances();
  const { data: loans = [] } = useLoans();
  const { data: globalSettings } = usePayRuleSettings();
  const { data: allOverrides = [] } = useAllEmployeePayOverrides();
  const { data: paidRuns = [] } = usePayrollHistory();

  return useMemo(() => {
    if (!globalSettings) return [];

    const active = employees.filter((e) => e.isActive);
    return active.map((emp) =>
      buildDraftRow(emp, attendance, advances, loans, globalSettings, allOverrides, paidRuns),
    );
  }, [employees, attendance, advances, loans, globalSettings, allOverrides, paidRuns]);
}
