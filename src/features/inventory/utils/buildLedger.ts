import type { Expense } from "@/features/expenses/types";
import type { Sale } from "@/features/sales/types";
import type { InventoryLedgerEntry, StockAdjustment } from "../types";

export function buildLedger(
  productId: string,
  dateRange: string[],
  expenses: Expense[],
  sales: Sale[],
  adjustments: StockAdjustment[],
): InventoryLedgerEntry[] {
  const adjByDate = new Map<string, { qty: number; note?: string }>();
  for (const adj of adjustments) {
    if (adj.productId === productId) {
      adjByDate.set(adj.date, { qty: adj.quantity, note: adj.note });
    }
  }

  let runningOpening = 0;
  return dateRange.map((date) => {
    const purchasedQty = expenses
      .filter((e) => e.date === date)
      .reduce((sum, e) => {
        if (e.items && e.items.length > 0) {
          const matched = e.items.filter((i) => i.productId === productId);
          return sum + matched.reduce((s, i) => s + (i.quantityPurchased ?? 0), 0);
        }
        if (e.productId === productId) {
          return sum + (e.quantityPurchased ?? 0);
        }
        return sum;
      }, 0);

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
