import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { stockAdjRowToApp } from "@/lib/supabaseMappers";
import { useProducts } from "@/features/products/hooks/useProducts";
import type { StockAdjustment } from "../types";

export const stockAdjLogKey = ["stockAdjustments", "log"] as const;

export type AdjustmentWithProduct = StockAdjustment & { productName: string };

export interface AdjustmentsLogData {
  /** Manual adjustments (spoilage, waste, recount, ...). */
  log: AdjustmentWithProduct[];
  /** Purchase movements created from expenses with line items. */
  purchases: AdjustmentWithProduct[];
}

export function useAdjustmentsLog(): AdjustmentsLogData {
  const { data: products = [] } = useProducts();

  const { data: adjustments = [] } = useQuery({
    queryKey: stockAdjLogKey,
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
    const productMap = new Map(products.map((p) => [p.id, p.name]));
    const withNames = adjustments.map((adj) => ({
      ...adj,
      productName: productMap.get(adj.productId) ?? "Unknown",
    }));
    return {
      log: withNames.filter((a) => a.source === "adjustment"),
      purchases: withNames.filter((a) => a.source === "purchase"),
    };
  }, [adjustments, products]);
}
