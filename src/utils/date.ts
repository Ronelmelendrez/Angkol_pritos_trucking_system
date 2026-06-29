/**
 * Date formatting helpers. All dates are stored as ISO strings ("YYYY-MM-DD" for
 * date-only columns, full ISO timestamps for clock in/out) and displayed in
 * Asia/Manila-friendly, human formats.
 */

/** Returns today's date as "YYYY-MM-DD" (for date-only DB columns) */
export function todayISO(): string {
  const d = new Date()
  return toDateOnlyISO(d)
}

/** Converts a Date to "YYYY-MM-DD" using local time (avoids UTC day-shift bugs) */
export function toDateOnlyISO(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/** Formats "YYYY-MM-DD" or an ISO timestamp as "Jun 21, 2026" */
export function formatDateLong(isoDate: string): string {
  if (!isoDate) return "—"
  const date = new Date(isoDate.length <= 10 ? `${isoDate}T00:00:00` : isoDate)
  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

/** Formats "YYYY-MM-DD" as "Jun 21" (compact, for charts/tables) */
export function formatDateShort(isoDate: string): string {
  if (!isoDate) return "—"
  const date = new Date(isoDate.length <= 10 ? `${isoDate}T00:00:00` : isoDate)
  return date.toLocaleDateString("en-PH", { month: "short", day: "numeric" })
}

/** Formats a timestamp as "8:32 AM" */
export function formatTime(isoTimestamp: string | null | undefined): string {
  if (!isoTimestamp) return "—"
  const date = new Date(isoTimestamp)
  return date.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" })
}

/** Formats a timestamp as "Jun 21, 8:32 AM" */
export function formatDateTime(isoTimestamp: string | null | undefined): string {
  if (!isoTimestamp) return "—"
  const date = new Date(isoTimestamp)
  return `${formatDateShort(toDateOnlyISO(date))}, ${formatTime(isoTimestamp)}`
}

/** Computes hours worked (decimal) between two ISO timestamps */
export function hoursBetween(start: string, end: string | null): number {
  if (!end) return 0
  const ms = new Date(end).getTime() - new Date(start).getTime()
  return Math.max(0, ms / (1000 * 60 * 60))
}

/** Returns the first and last day of the current month as "YYYY-MM-DD" */
export function currentMonthRange(): { start: string; end: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return { start: toDateOnlyISO(start), end: toDateOnlyISO(end) }
}

/** Returns an array of "YYYY-MM-DD" strings for the last N days, including today */
export function lastNDays(n: number): string[] {
  const days: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(toDateOnlyISO(d))
  }
  return days
}