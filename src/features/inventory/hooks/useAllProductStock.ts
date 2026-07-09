import { useMemo } from "react";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useExpenses } from "@/features/expenses/hooks/useExpenses";
import { useSales } from "@/features/sales/hooks/useSales";
import { adjustmentsTable } from "@/lib/mockData";
import { buildLedger } from "../utils/buildLedger";
import { todayISO } from "@/utils/date";

export interface ProductStockInfo {
  productId: string;
  productName: string;
  unit: string;
  closingQty: number;
  openingQty: number;
  purchasedQty: number;
  soldQty: number;
}

export function useAllProductStock() {
  const { data: products = [] } = useProducts();
  const { data: expenses = [] } = useExpenses();
  const { data: sales = [] } = useSales();
  const adjustments = adjustmentsTable.list();
  const today = todayISO();

  return useMemo(() => {
    const active = products.filter((p) => p.isActive);
    return active.map((p) => {
      const entries = buildLedger(p.id, [today], expenses, sales, adjustments);
      const current = entries[entries.length - 1];
      return {
        productId: p.id,
        productName: p.name,
        unit: p.unit,
        closingQty: current?.closingQty ?? 0,
        openingQty: current?.openingQty ?? 0,
        purchasedQty: current?.purchasedQty ?? 0,
        soldQty: current?.soldQty ?? 0,
      } satisfies ProductStockInfo;
    });
  }, [products, expenses, sales, adjustments, today]);
}
