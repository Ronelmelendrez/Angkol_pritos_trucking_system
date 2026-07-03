import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { expensesTable } from "@/lib/mockData";
import type { Expense, NewExpense, UpdateExpense } from "../types";

/**
 * All expense data access lives here. When Supabase is added, only the
 * bodies of the `queryFn`/`mutationFn` callbacks change (to
 * `supabase.from("expenses")...`) — every component using these hooks
 * keeps working unmodified.
 */
const EXPENSES_KEY = ["expenses"] as const;
export const expensesKeys = {
  all: EXPENSES_KEY,
};

export function useExpenses() {
  return useQuery({
    queryKey: EXPENSES_KEY,
    queryFn: () => expensesTable.list(),
  });
}

export function useAddExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewExpense) => expensesTable.create(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: EXPENSES_KEY });
      const previous = queryClient.getQueryData<Expense[]>(EXPENSES_KEY) ?? [];
      const optimistic: Expense = {
        ...input,
        id: `temp_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      queryClient.setQueryData<Expense[]>(EXPENSES_KEY, [optimistic, ...previous]);
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) queryClient.setQueryData(EXPENSES_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: EXPENSES_KEY }),
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: UpdateExpense) => expensesTable.update(id, patch),
    onSettled: () => queryClient.invalidateQueries({ queryKey: EXPENSES_KEY }),
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expensesTable.remove(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: EXPENSES_KEY });
      const previous = queryClient.getQueryData<Expense[]>(EXPENSES_KEY) ?? [];
      queryClient.setQueryData<Expense[]>(
        EXPENSES_KEY,
        previous.filter((e) => e.id !== id)
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(EXPENSES_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: EXPENSES_KEY }),
  });
}