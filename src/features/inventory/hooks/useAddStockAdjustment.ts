import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adjustmentsTable } from "@/lib/mockData";
import type { NewStockAdjustment } from "@/lib/mockData";
import { useToast } from "@/components/ui/useToast";

const ADJUSTMENTS_KEY = ["stockAdjustments"] as const;

export function useAddStockAdjustment() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: NewStockAdjustment) => adjustmentsTable.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADJUSTMENTS_KEY });
      toast({ title: "Adjustment recorded", variant: "success" });
    },
    onError: () => {
      toast({ title: "Couldn't save adjustment", variant: "error" });
    },
  });
}
