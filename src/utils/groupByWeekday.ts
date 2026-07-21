const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export interface WeekdayBucket {
  day: string;
  dayIndex: number;
  total: number;
  count: number;
  average: number;
}

export function groupByWeekday(
  records: { date: string; amount: number }[],
): WeekdayBucket[] {
  const buckets: WeekdayBucket[] = DAY_NAMES.map((day, i) => ({
    day,
    dayIndex: i,
    total: 0,
    count: 0,
    average: 0,
  }));

  for (const rec of records) {
    const d = new Date(rec.date + "T00:00:00");
    const idx = d.getDay();
    buckets[idx].total += rec.amount;
    buckets[idx].count += 1;
  }

  for (const b of buckets) {
    b.average = b.count > 0 ? b.total / b.count : 0;
  }

  return buckets;
}
