import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { stockAdjAppToRow } from "@/lib/supabaseMappers";
import { useToast } from "@/components/ui/useToast";

const ADJUSTMENTS_KEY = ["stockAdjustments"] as const;

export function useAddStockAdjustment() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { productId: string; date: string; quantity: number; note: string }) => {
      const { data, error } = await supabase
        .from("stock_adjustments")
        .insert(stockAdjAppToRow(input))
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADJUSTMENTS_KEY });
      toast({ title: "Adjustment recorded", variant: "success" });
    },
    onError: () => {
      toast({ title: "Couldn't save adjustment", variant: "error" });
    },
  });
}
