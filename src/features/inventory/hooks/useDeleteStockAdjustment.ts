import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adjustmentsTable } from "@/lib/mockData";
import { useToast } from "@/components/ui/useToast";

const ADJUSTMENTS_KEY = ["stockAdjustments"] as const;

export function useDeleteStockAdjustment() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adjustmentsTable.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADJUSTMENTS_KEY });
      toast({ title: "Adjustment deleted", variant: "success" });
    },
    onError: () => {
      toast({ title: "Couldn't delete adjustment", variant: "error" });
    },
  });
}
