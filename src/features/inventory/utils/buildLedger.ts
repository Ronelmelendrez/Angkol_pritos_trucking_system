import type { Sale } from "@/features/sales/types";
import type { InventoryLedgerEntry, StockAdjustment } from "../types";

export function buildLedger(
  productId: string,
  dateRange: string[],
  sales: Sale[],
  adjustments: StockAdjustment[],
): InventoryLedgerEntry[] {
  const purchasesByDate = new Map<string, number>();
  const adjByDate = new Map<string, { qty: number; note?: string }>();

  for (const adj of adjustments) {
    if (adj.productId !== productId) continue;
    if (adj.source === "purchase") {
      purchasesByDate.set(adj.date, (purchasesByDate.get(adj.date) ?? 0) + adj.quantity);
    } else {
      const existing = adjByDate.get(adj.date);
      if (existing) {
        existing.qty += adj.quantity;
      } else {
        adjByDate.set(adj.date, { qty: adj.quantity, note: adj.note });
      }
    }
  }

  let runningOpening = 0;
  return dateRange.map((date) => {
    const purchasedQty = purchasesByDate.get(date) ?? 0;

    const soldQty = sales
      .filter((s) => s.productId === productId && s.date === date)
      .reduce((sum, s) => sum + s.quantitySold, 0);

    const adjustment = adjByDate.get(date);
    const adjQty = adjustment?.qty ?? 0;
    const closingQty = runningOpening + purchasedQty - soldQty + adjQty;

    const entry: InventoryLedgerEntry = {
      productId,
      date,
      openingQty: runningOpening,
      purchasedQty,
      soldQty,
      adjustmentQty: adjQty,
      adjustmentNote: adjustment?.note,
      closingQty,
    };

    runningOpening = closingQty;
    return entry;
  });
}
