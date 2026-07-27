import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { stockAdjRowToApp } from "@/lib/supabaseMappers";
import { useProducts } from "@/features/products/hooks/useProducts";

export const stockAdjLogKey = ["stockAdjustments", "log"] as const;

export function useAdjustmentsLog() {
  const { data: products = [] } = useProducts();

  const { data: adjustments = [] } = useQuery({
    queryKey: stockAdjLogKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stock_adjustments")
        .select("*")
        .eq("source", "adjustment")
        .order("date", { ascending: false });
      if (error) throw error;
      return data.map(stockAdjRowToApp);
    },
  });

  return useMemo(() => {
    const productMap = new Map(products.map((p) => [p.id, p.name]));
    return adjustments.map((adj) => ({
      ...adj,
      productName: productMap.get(adj.productId) ?? "Unknown",
    }));
  }, [adjustments, products]);
}
