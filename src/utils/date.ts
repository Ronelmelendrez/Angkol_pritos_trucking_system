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

/** Convert a 24h "HH:mm" string to "h:mm AM/PM" */
export function formatTime12h(time: string): string {
  if (!time) return "";
  const [hStr, mStr] = time.split(":");
  const hour = parseInt(hStr, 10);
  const min = mStr ?? "00";
  const suffix = hour >= 12 ? "PM" : "AM";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${min} ${suffix}`;
}

/** Get urgency for a scheduled time relative to now */
export function getTimeUrgency(time: string): "overdue" | "soon" | "upcoming" {
  if (!time) return "upcoming";
  const now = new Date();
  const [hStr, mStr] = time.split(":");
  const target = new Date(now);
  target.setHours(parseInt(hStr, 10), parseInt(mStr ?? "0", 10), 0, 0);
  const diffMs = target.getTime() - now.getTime();
  if (diffMs < 0) return "overdue";
  if (diffMs < 60 * 60 * 1000) return "soon";
  return "upcoming";
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