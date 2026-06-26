import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"
import type { Expense } from "@/types"
import type { ExpenseFormSchemaOutput } from "@/utils/validators"
import { expensesKeys } from "@/features/expenses/hooks/useExpenses"

interface UpdateExpenseInput {
  id: string
  values: ExpenseFormSchemaOutput
}

async function updateExpense({ id, values }: UpdateExpenseInput): Promise<Expense> {
  const { data, error } = await supabase
    .from("expenses")
    .update({
      expense_date: values.expense_date,
      category: values.category,
      description: values.description || null,
      amount: values.amount,
      supplier: values.supplier || null,
      payment_method: values.payment_method,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as Expense
}

export function useUpdateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateExpense,
    onMutate: async ({ id, values }) => {
      await queryClient.cancelQueries({ queryKey: expensesKeys.all })

      const previous = queryClient.getQueriesData<Expense[]>({
        queryKey: expensesKeys.all,
      })

      queryClient.setQueriesData<Expense[]>({ queryKey: expensesKeys.all }, (old) =>
        old?.map((expense) =>
          expense.id === id
            ? {
                ...expense,
                expense_date: values.expense_date,
                category: values.category,
                description: values.description || null,
                amount: values.amount,
                supplier: values.supplier || null,
                payment_method: values.payment_method,
              }
            : expense
        )
      )

      return { previous }
    },
    onError: (error: Error, _vars, context) => {
      context?.previous.forEach(([key, data]) => {
        queryClient.setQueryData(key, data)
      })
      toast.error("Couldn't update expense", { description: error.message })
    },
    onSuccess: () => {
      toast.success("Expense updated")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: expensesKeys.all })
    },
  })
}