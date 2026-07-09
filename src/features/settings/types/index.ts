import type { BaseRecord } from "@/types";
import type { PayFrequency } from "@/features/payroll/utils/payPeriods";

export interface PaydayRule {
  frequency: PayFrequency;
  offsetDays: number;
  weekendAdjustment: "none" | "move_earlier" | "move_later";
  fixedWeekday?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

export interface PayRuleSettings {
  id: string;
  defaultReorderThreshold: number;
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
  paydayRules: PaydayRule[];
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
