import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { stockAdjRowToApp } from "@/lib/supabaseMappers";
import { useSales } from "@/features/sales/hooks/useSales";
import { buildLedger } from "../utils/buildLedger";

import { stockAdjAllKey } from "./useAllProductStock";

export function useInventoryLedger(productId: string, dateRange: string[]) {
  const { data: sales = [] } = useSales();

  const { data: adjustments = [] } = useQuery({
    queryKey: stockAdjAllKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stock_adjustments")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data.map(stockAdjRowToApp);
    },
  });

  return useMemo(
    () => buildLedger(productId, dateRange, sales, adjustments),
    [productId, dateRange, sales, adjustments],
  );
}
