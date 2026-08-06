import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { stockAdjAppToRow, stockAdjRowToApp } from "@/lib/supabaseMappers";
import { useToast } from "@/components/ui/useToast";
import { todayISO } from "@/utils/date";
import { stockAdjLogKey } from "./useAdjustmentsLog";
import { stockAdjAllKey } from "./useAllProductStock";

export function useReverseStockAdjustment() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: original, error: fetchError } = await supabase
        .from("stock_adjustments")
        .select("*")
        .eq("id", id)
        .single();
      if (fetchError) throw fetchError;

      const reversal = stockAdjRowToApp(original);
      if (reversal.quantity === 0) return;

      const { error: insertError } = await supabase
        .from("stock_adjustments")
        .insert(
          stockAdjAppToRow({
            productId: reversal.productId,
            date: todayISO(),
            quantity: -reversal.quantity,
            reason: "other",
            note: reversal.note
              ? `Reversal of ${reversal.date} adjustment — ${reversal.note}`
              : `Reversal of ${reversal.date} adjustment`,
          }),
        );
      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockAdjLogKey });
      queryClient.invalidateQueries({ queryKey: stockAdjAllKey });
      toast({ title: "Adjustment reversed", variant: "success" });
    },
    onError: () => {
      toast({ title: "Couldn't reverse adjustment", variant: "error" });
    },
  });
}
