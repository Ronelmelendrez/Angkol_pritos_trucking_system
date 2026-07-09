import { useMemo } from "react";
import { useProducts } from "@/features/products/hooks/useProducts";
import { adjustmentsTable } from "@/lib/mockData";

export function useAdjustmentsLog() {
  const { data: products = [] } = useProducts();
  const adjustments = adjustmentsTable.list();

  return useMemo(() => {
    const productMap = new Map(products.map((p) => [p.id, p.name]));
    return [...adjustments]
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .map((adj) => ({
        ...adj,
        productName: productMap.get(adj.productId) ?? "Unknown",
      }));
  }, [adjustments, products]);
}
