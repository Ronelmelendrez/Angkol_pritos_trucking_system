import { useMemo } from "react";
import { format, subDays } from "date-fns";
import { useAdjustmentsLog } from "./useAdjustmentsLog";

/**
 * Flags products whose stock loss rate over the last 30 days (any negative
 * adjustment — spoilage, waste, theft, recount shortage, other) is notably
 * above their own historical average (>= 5% AND at least 2x the prior rate,
 * or >= 5% with no prior purchase history). Used to surface a subtle
 * "something changed with this one item" signal on stock cards.
 */
export function useAdjustmentFlags(): Record<string, boolean> {
  const { log: adjustments, purchases } = useAdjustmentsLog();

  return useMemo(() => {
    const cutoff = format(subDays(new Date(), 30), "yyyy-MM-dd");
    const productIds = new Set<string>([
      ...adjustments.filter((a) => a.quantity < 0).map((a) => a.productId),
      ...purchases.filter((p) => p.quantity > 0).map((p) => p.productId),
    ]);

    const flags: Record<string, boolean> = {};
    for (const productId of productIds) {
      const recentLoss = adjustments
        .filter((a) => a.productId === productId && a.quantity < 0 && a.date >= cutoff)
        .reduce((sum, a) => sum + Math.abs(a.quantity), 0);
      const priorLoss = adjustments
        .filter((a) => a.productId === productId && a.quantity < 0 && a.date < cutoff)
        .reduce((sum, a) => sum + Math.abs(a.quantity), 0);

      const recentPurchased = purchases
        .filter((p) => p.productId === productId && p.quantity > 0 && p.date >= cutoff)
        .reduce((sum, p) => sum + p.quantity, 0);
      const priorPurchased = purchases
        .filter((p) => p.productId === productId && p.quantity > 0 && p.date < cutoff)
        .reduce((sum, p) => sum + p.quantity, 0);

      if (recentLoss > 0 && recentPurchased > 0) {
        const recentRate = recentLoss / recentPurchased;
        const priorRate = priorPurchased > 0 ? priorLoss / priorPurchased : 0;
        flags[productId] = recentRate >= 0.05 && (priorPurchased === 0 || recentRate >= 2 * priorRate);
      }
    }
    return flags;
  }, [adjustments, purchases]);
}
