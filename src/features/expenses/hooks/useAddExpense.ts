import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"
import type { Expense } from "@/types"
import type { ExpenseFormSchemaOutput } from "@/utils/validators"
import { expensesKeys } from "@/features/expenses/hooks/useExpenses"

async function insertExpense(values: ExpenseFormSchemaOutput): Promise<Expense> {
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      expense_date: values.expense_date,
      category: values.category,
      description: values.description || null,
      amount: values.amount,
      supplier: values.supplier || null,
      payment_method: values.payment_method,
    })
    .select()
    .single()

  if (error) throw error
  return data as Expense
}

export function useAddExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: insertExpense,
    onMutate: async (values) => {
      await queryClient.cancelQueries({ queryKey: expensesKeys.all })

      const optimisticExpense: Expense = {
        id: `optimistic-${Date.now()}`,
        expense_date: values.expense_date,
        category: values.category,
        description: values.description || null,
        amount: values.amount,
        supplier: values.supplier || null,
        payment_method: values.payment_method,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const previous = queryClient.getQueriesData<Expense[]>({
        queryKey: expensesKeys.all,
      })

      queryClient.setQueriesData<Expense[]>({ queryKey: expensesKeys.all }, (old) =>
        old ? [optimisticExpense, ...old] : [optimisticExpense]
      )

      return { previous }
    },
    onError: (error: Error, _values, context) => {
      context?.previous.forEach(([key, data]) => {
        queryClient.setQueryData(key, data)
      })
      toast.error("Couldn't save expense", { description: error.message })
    },
    onSuccess: () => {
      toast.success("Expense recorded")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: expensesKeys.all })
    },
  })
}