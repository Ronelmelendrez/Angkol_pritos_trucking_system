import type { BaseRecord } from "@/types";

export interface PayRuleSettings {
  id: string;
  standardHoursPerDay: number;
  halfDayThresholdHours: number;
  halfDayRateMultiplier: number;
  overtimeRateMultiplier: number;
  lateGraceMinutes: number;
  lateDeductionPerMinute: number;
  absenceDeductionMode: "full_day" | "none";
  restDayRateMultiplier: number;
  holidayRateMultiplier: number;
  nightDifferentialPercent: number;
  roundHoursTo: 0 | 0.25 | 0.5;
  createdAt: string;
  updatedAt: string;
}

export type NewPayRuleSettings = Omit<PayRuleSettings, keyof BaseRecord>;

export interface EmployeePayOverride {
  id: string;
  employeeId: string;
  halfDayRateMultiplier?: number;
  overtimeRateMultiplier?: number;
  lateDeductionPerMinute?: number;
  createdAt: string;
  updatedAt: string;
}

export type SetEmployeePayOverride = Omit<EmployeePayOverride, keyof BaseRecord>;
