export interface GroupedRow {
  key: string;
  label: string;
  total: number;
  count: number;
  percentOfTotal: number;
}

export function groupByKey<T>(
  items: T[],
  getKey: (item: T) => string,
  getAmount: (item: T) => number,
  getLabel?: (key: string) => string,
): GroupedRow[] {
  const map = new Map<string, { total: number; count: number }>();
  for (const item of items) {
    const key = getKey(item);
    const entry = map.get(key) ?? { total: 0, count: 0 };
    entry.total += getAmount(item);
    entry.count += 1;
    map.set(key, entry);
  }
  const grandTotal = Array.from(map.values()).reduce((s, e) => s + e.total, 0);
  return Array.from(map.entries())
    .map(([key, { total, count }]) => ({
      key,
      label: getLabel?.(key) ?? key,
      total,
      count,
      percentOfTotal: grandTotal > 0 ? (total / grandTotal) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}
