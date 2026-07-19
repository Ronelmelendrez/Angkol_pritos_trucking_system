import type { PayRuleSettings, EmployeePayOverride } from "../types";

export function resolvePayRules(
  global: PayRuleSettings,
  override?: EmployeePayOverride | null,
): PayRuleSettings {
  if (!override) return global;
  return {
    ...global,
    ...(override.halfDayRateMultiplier != null && { halfDayRateMultiplier: override.halfDayRateMultiplier }),
    ...(override.lateDeductionPerMinute != null && { lateDeductionPerMinute: override.lateDeductionPerMinute }),
  };
}

export interface GrossPayInput {
  hoursWorked: number;
  shift: "full" | "half" | null;
  clockIn: string | null;
  clockOut: string | null;
}

export function computeGrossPay(
  records: GrossPayInput[],
  dailyRate: number,
  rules: PayRuleSettings,
): number {
  let total = 0;

  for (const r of records) {
    if (r.hoursWorked == null || r.hoursWorked === 0) continue;

    let hours = r.hoursWorked;

    if (r.shift === "half") {
      total += dailyRate * rules.halfDayRateMultiplier;
      continue;
    }

    if (r.shift === "full") {
      total += dailyRate;
      continue;
    }

    hours = roundHours(hours, rules.roundHoursTo);

    if (hours <= rules.halfDayThresholdHours) {
      total += dailyRate * rules.halfDayRateMultiplier;
    } else {
      total += (hours / rules.standardHoursPerDay) * dailyRate;
    }
  }

  return Math.round(total * 100) / 100;
}

function roundHours(hours: number, granularity: 0 | 0.25 | 0.5): number {
  if (granularity === 0) return hours;
  return Math.round(hours / granularity) * granularity;
}
