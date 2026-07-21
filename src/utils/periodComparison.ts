export interface PeriodComparison {
  current: number;
  previous: number;
  diff: number;
  percentChange: number;
}

export function comparePeriods(currentTotal: number, previousTotal: number): PeriodComparison {
  const diff = currentTotal - previousTotal;
  const percentChange = previousTotal > 0
    ? Math.round((diff / previousTotal) * 100)
    : currentTotal > 0
      ? 100
      : 0;
  return { current: currentTotal, previous: previousTotal, diff, percentChange };
}
