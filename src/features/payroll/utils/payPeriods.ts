import { startOfWeek } from "date-fns/startOfWeek";
import { endOfWeek } from "date-fns/endOfWeek";
import { startOfMonth, endOfMonth, format } from "date-fns";

export type PayFrequency = "weekly" | "semi_monthly" | "monthly";
export type PayFrequencyFilter = PayFrequency | "all";

export interface PayPeriod {
  start: string;
  end: string;
  label: string;
}

export function getCurrentPeriod(frequency: PayFrequency, referenceDate: Date = new Date()): PayPeriod {
  switch (frequency) {
    case "weekly": {
      const start = startOfWeek(referenceDate, { weekStartsOn: 1 });
      const end = endOfWeek(referenceDate, { weekStartsOn: 1 });
      const label = `${format(start, "MMM d")}-${format(end, "d, yyyy")}`;
      return { start: format(start, "yyyy-MM-dd"), end: format(end, "yyyy-MM-dd"), label };
    }
    case "semi_monthly": {
      const month = referenceDate.getMonth();
      const year = referenceDate.getFullYear();
      const day = referenceDate.getDate();
      const midMonth = 15;
      if (day <= midMonth) {
        const start = new Date(year, month, 1);
        const end = new Date(year, month, midMonth);
        const label = `${format(start, "MMM d")}-${format(end, "d, yyyy")}`;
        return { start: format(start, "yyyy-MM-dd"), end: format(end, "yyyy-MM-dd"), label };
      }
      const start = new Date(year, month, 16);
      const end = endOfMonth(referenceDate);
      const label = `${format(start, "MMM d")}-${format(end, "d, yyyy")}`;
      return { start: format(start, "yyyy-MM-dd"), end: format(end, "yyyy-MM-dd"), label };
    }
    case "monthly": {
      const start = startOfMonth(referenceDate);
      const end = endOfMonth(referenceDate);
      const label = format(start, "MMMM yyyy");
      return { start: format(start, "yyyy-MM-dd"), end: format(end, "yyyy-MM-dd"), label };
    }
  }
}

export function getPreviousPeriods(frequency: PayFrequency, count: number, referenceDate: Date = new Date()): PayPeriod[] {
  const periods: PayPeriod[] = [];
  let cursor = new Date(referenceDate);
  for (let i = 0; i < count; i++) {
    const current = getCurrentPeriod(frequency, cursor);
    periods.unshift(current);
    cursor = new Date(current.start);
    cursor.setDate(cursor.getDate() - 1);
  }
  return periods;
}
