import { BREAKPOINTS, useMediaQuery } from "@/hooks/useMediaQuery";

/**
 * Target number of X-axis labels to show for the current screen size so
 * labels never overlap on phones, tablets, or desktops.
 */
export function useChartLabelCount(): number {
  const isSm = useMediaQuery(BREAKPOINTS.sm);
  const isLg = useMediaQuery(BREAKPOINTS.lg);
  if (!isSm) return 3; // phones
  if (!isLg) return 5; // tablets / small laptops
  return 7; // desktop
}

/** X-axis `interval` that keeps ~`count` evenly spaced labels visible. */
export function chartXInterval(length: number, count: number): number {
  return Math.max(0, Math.ceil(length / count) - 1);
}
