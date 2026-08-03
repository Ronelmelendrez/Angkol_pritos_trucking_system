import {
  format,
  formatDistanceToNow,
  isToday,
  isThisMonth,
  startOfMonth,
  endOfMonth,
  differenceInMinutes,
  parseISO,
} from "date-fns";

/** e.g. "Jun 30, 2026" */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d, yyyy");
}

/** e.g. "8:32 AM" */
export function formatTime(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "h:mm a");
}

/** e.g. "Jun 30, 8:32 AM" */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d, h:mm a");
}

export function relativeTime(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function isDateToday(date: string | Date): boolean {
  const d = typeof date === "string" ? parseISO(date) : date;
  return isToday(d);
}

export function isDateThisMonth(date: string | Date): boolean {
  const d = typeof date === "string" ? parseISO(date) : date;
  return isThisMonth(d);
}

export function monthRange(date: Date = new Date()) {
  return { start: startOfMonth(date), end: endOfMonth(date) };
}

/** Hours worked as a decimal, e.g. 7.5 */
export function hoursBetween(clockIn: string, clockOut: string): number {
  const minutes = differenceInMinutes(parseISO(clockOut), parseISO(clockIn));
  return Math.round((minutes / 60) * 100) / 100;
}

export function todayISO(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Build a UTC ISO timestamp for a local wall-clock date + time, e.g.
 * localISO("2026-08-03", 5, 0) → the instant of 5:00 AM in the user's
 * timezone, serialized to UTC so it round-trips through timestamptz.
 */
export function localISO(date: string, hour: number, minute = 0): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0).toISOString();
}