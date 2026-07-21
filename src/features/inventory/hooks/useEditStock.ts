import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adjustmentsTable } from "@/lib/mockData";
import type { NewStockAdjustment } from "@/lib/mockData";
import { useToast } from "@/components/ui/useToast";
import { useAllProductStock } from "./useAllProductStock";

const ADJUSTMENTS_KEY = ["stockAdjustments"] as const;

export function useCurrentStock(productId: string) {
  const stockData = useAllProductStock();
  return useMemo(() => stockData.find((s) => s.productId === productId), [stockData, productId]);
}

export function useSetStock() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { productId: string; date: string; targetQty: number; currentQty: number; note: string }) => {
      const delta = input.targetQty - input.currentQty;
      if (delta === 0) return null;

      const adjustment: NewStockAdjustment = {
        productId: input.productId,
        date: input.date,
        quantity: delta,
        note: input.note || `Stock set to ${input.targetQty}`,
      };
      return adjustmentsTable.create(adjustment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADJUSTMENTS_KEY });
      toast({ title: "Stock updated", variant: "success" });
    },
    onError: () => {
      toast({ title: "Couldn't update stock", variant: "error" });
    },
  });
}
