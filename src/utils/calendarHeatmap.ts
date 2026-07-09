export interface DayTotal {
  date: string;
  total: number;
  count: number;
}

/** Builds a complete array of DayTotal for every day in the given range.
 *  Days with no matching items get total = 0 / count = 0. */
export function buildDayTotals<T>(
  items: T[],
  getDate: (item: T) => string,
  getAmount: (item: T) => number,
  range: { start: Date; end: Date },
): DayTotal[] {
  const dayMap = new Map<string, { total: number; count: number }>();
  for (const item of items) {
    const date = getDate(item);
    const entry = dayMap.get(date) ?? { total: 0, count: 0 };
    entry.total += getAmount(item);
    entry.count += 1;
    dayMap.set(date, entry);
  }
  const result: DayTotal[] = [];
  const cursor = new Date(range.start);
  while (cursor <= range.end) {
    const key = cursor.toISOString().slice(0, 10);
    const data = dayMap.get(key);
    result.push({
      date: key,
      total: data?.total ?? 0,
      count: data?.count ?? 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
}
