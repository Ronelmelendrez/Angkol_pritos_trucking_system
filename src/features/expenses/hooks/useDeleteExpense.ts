import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"
import { expensesKeys } from "@/features/expenses/hooks/useExpenses"

async function removeExpense(id: string) {
  const { error } = await supabase.from("expenses").delete().eq("id", id)
  if (error) throw error
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: removeExpense,
    onSuccess: () => {
      toast.success("Expense deleted")
      queryClient.invalidateQueries({ queryKey: expensesKeys.all })
    },
    onError: (error: Error) => {
      toast.error("Couldn't delete expense", { description: error.message })
    },
  })
}