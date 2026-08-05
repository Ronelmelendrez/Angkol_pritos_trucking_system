import type { Expense } from "@/features/expenses/types";
import type { Product } from "@/features/products/types";

/**
 * Cost per unit for a product, computed from its recent purchase history
 * (the last 3 purchase-linked expenses that carry a quantity).
 *
 * Falls back to the product's `estimatedCostPerUnit` when there is no
 * purchase history. Returns `null` only when neither source exists so
 * callers can show "—" instead of a misleading ₱0 (which would look like
 * spoilage is free). Only positive quantities are counted — a recount
 * finding more stock is informational, not a purchase.
 */
export function estimateUnitCost(
  productId: string,
  products: Product[],
  expenses: Expense[],
): number | null {
  const purchases = expenses
    .filter((e) => e.productId === productId && (e.quantityPurchased ?? 0) > 0 && e.amount > 0)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  if (purchases.length > 0) {
    const totalQty = purchases.reduce((sum, e) => sum + (e.quantityPurchased ?? 0), 0);
    const totalAmount = purchases.reduce((sum, e) => sum + e.amount, 0);
    if (totalQty > 0) return totalAmount / totalQty;
  }

  const product = products.find((p) => p.id === productId);
  if (product && product.estimatedCostPerUnit != null && product.estimatedCostPerUnit > 0) {
    return product.estimatedCostPerUnit;
  }

  return null;
}
