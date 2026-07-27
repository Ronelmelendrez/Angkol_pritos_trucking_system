import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { stockAdjRowToApp } from "@/lib/supabaseMappers";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useSales } from "@/features/sales/hooks/useSales";
import { buildLedger } from "../utils/buildLedger";
import { todayISO } from "@/utils/date";

const ADJUSTMENTS_KEY = ["stockAdjustments"] as const;

export interface ProductStockInfo {
  productId: string;
  productName: string;
  unit: string;
  closingQty: number;
  openingQty: number;
  purchasedQty: number;
  soldQty: number;
  adjustmentQty: number;
}

export function useAllProductStock() {
  const { data: products = [] } = useProducts();
  const { data: sales = [] } = useSales();
  const today = todayISO();

  const { data: adjustments = [] } = useQuery({
    queryKey: ADJUSTMENTS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stock_adjustments")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data.map(stockAdjRowToApp);
    },
  });

  return useMemo(() => {
    const active = products.filter((p) => p.isActive);
    return active.map((p) => {
      const entries = buildLedger(p.id, [today], sales, adjustments);
      const current = entries[entries.length - 1];
      return {
        productId: p.id,
        productName: p.name,
        unit: p.unit,
        closingQty: current?.closingQty ?? 0,
        openingQty: current?.openingQty ?? 0,
        purchasedQty: current?.purchasedQty ?? 0,
        soldQty: current?.soldQty ?? 0,
        adjustmentQty: current?.adjustmentQty ?? 0,
      } satisfies ProductStockInfo;
    });
  }, [products, sales, adjustments, today]);
}
