import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/useToast";

const ADJUSTMENTS_KEY = ["stockAdjustments"] as const;

export function useDeleteStockAdjustment() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("stock_adjustments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADJUSTMENTS_KEY });
      toast({ title: "Adjustment deleted", variant: "success" });
    },
    onError: () => {
      toast({ title: "Couldn't delete adjustment", variant: "error" });
    },
  });
}
