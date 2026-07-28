import { addDays } from "date-fns/addDays";
import { nextDay } from "date-fns/nextDay";
import { startOfWeek } from "date-fns/startOfWeek";
import { previousFriday } from "date-fns/previousFriday";
import { nextMonday } from "date-fns/nextMonday";
import { isWeekend } from "date-fns/isWeekend";
import { format } from "date-fns/format";
import type { PaydayRule } from "@/features/settings/types";
import type { PayPeriod } from "./payPeriods";

export function getScheduledPayday(period: PayPeriod, rule: PaydayRule): string {
  const end = new Date(period.end + "T00:00:00");

  let date: Date;
  if (rule.fixedWeekday != null) {
    const weekStart = startOfWeek(end, { weekStartsOn: 1 });
    const ruleDay = (rule.fixedWeekday - 1 + 7) % 7;
    const candidate = addDays(weekStart, ruleDay);
    date = candidate <= end ? candidate : nextDay(end, rule.fixedWeekday);
  } else {
    date = addDays(end, rule.offsetDays);
  }

  if (rule.weekendAdjustment !== "none" && isWeekend(date)) {
    date =
      rule.weekendAdjustment === "move_earlier"
        ? previousFriday(date)
        : nextMonday(date);
  }

  return format(date, "yyyy-MM-dd");
}
