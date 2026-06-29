/**
 * Currency formatting helpers — Philippine Peso (₱).
 */

const phpFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  currencyDisplay: "symbol",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const phpFormatterNoDecimals = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  currencyDisplay: "symbol",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

/** Formats a number as "₱1,234.56" */
export function formatPHP(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return phpFormatter.format(0)
  }
  return phpFormatter.format(amount)
}

/** Formats a number as "₱1,234" (no decimals) — good for big dashboard totals */
export function formatPHPCompact(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return phpFormatterNoDecimals.format(0)
  }
  return phpFormatterNoDecimals.format(amount)
}

/** Parses a peso-formatted or raw numeric string into a number, e.g. "₱1,234.56" -> 1234.56 */
export function parsePHP(value: string): number {
  const cleaned = value.replace(/[^\d.-]/g, "")
  const parsed = parseFloat(cleaned)
  return Number.isNaN(parsed) ? 0 : parsed
}

/** Rounds a number to 2 decimal places, avoiding float drift (e.g. for currency math) */
export function roundCurrency(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100
}