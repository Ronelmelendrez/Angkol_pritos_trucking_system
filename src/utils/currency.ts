const PHP_FORMATTER = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const PHP_FORMATTER_COMPACT = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Formats a number as ₱1,234.56 */
export function formatCurrency(amount: number): string {
  return PHP_FORMATTER.format(amount ?? 0);
}

/** Formats a number as ₱1,234 (no decimals) for dense UI like tables/charts */
export function formatCurrencyCompact(amount: number): string {
  return PHP_FORMATTER_COMPACT.format(amount ?? 0);
}

const QTY_FORMATTER = new Intl.NumberFormat("en-PH", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Formats a stock quantity, stripping floating-point noise (e.g. 28.99000000000001 → "29") */
export function formatQty(qty: number): string {
  return QTY_FORMATTER.format(qty ?? 0);
}

/** Parses a user-entered peso string back into a number */
export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, "");
  const parsed = parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}