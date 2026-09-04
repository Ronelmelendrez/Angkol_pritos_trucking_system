import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { expenseRowToApp, expenseAppToRow } from "@/lib/supabaseMappers";
import { getCategoryIdByName, getCategoryNameById } from "@/lib/categories";
import type { Database } from "@/types/database.types";
import type { Expense, NewExpense, UpdateExpense } from "../types";

const EXPENSES_KEY = ["expenses"] as const;
export const expensesKeys = {
  all: EXPENSES_KEY,
};

export function useExpenses(branchId?: string) {
  return useQuery({
    queryKey: branchId ? [...EXPENSES_KEY, branchId] : EXPENSES_KEY,
    queryFn: async () => {
      let query = supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });

      if (branchId) {
        query = query.eq("branch_id", branchId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return Promise.all(data.map(async (row) => {
        const categoryName = await getCategoryNameById(row.category_id);
        return expenseRowToApp({ ...row, categories: { name: categoryName } });
      }));
    },
  });
}

export function useAddExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewExpense) => {
      const categoryId = await getCategoryIdByName(input.category);
      const payload = expenseAppToRow({
        date: input.date,
        category_id: categoryId,
        description: input.description,
        amount: input.amount,
        branch_id: input.branchId ?? null,
        supplier: input.supplier,
        paymentMethod: input.paymentMethod,
        fundSource: input.fundSource ?? null,
        product_id: input.productId || null,
        quantity_purchased: input.quantityPurchased || null,
        created_by: input.createdBy ?? null,
      });
      const { data, error } = await supabase
        .from("expenses")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;

      if (input.items && input.items.length > 0) {
        const adjustments = input.items.map((item) => ({
          product_id: item.productId,
          date: input.date,
          quantity: item.quantityPurchased,
          note: `Purchase: ${input.description}`,
          source: "purchase" as const,
        }));
        const { error: adjError } = await supabase
          .from("stock_adjustments")
          .insert(adjustments);
        if (adjError) throw adjError;
      }

      return expenseRowToApp({ ...data, categories: { name: input.category } });
    },
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
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_KEY });
      queryClient.invalidateQueries({ queryKey: ["stockAdjustments", "log"] });
      queryClient.invalidateQueries({ queryKey: ["stockAdjustments", "all"] });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: UpdateExpense) => {
      const updateRow: Database["public"]["Tables"]["expenses"]["Update"] = {};
      let resolvedCategory: string | undefined;
      if (patch.date !== undefined) updateRow.date = patch.date;
      if (patch.description !== undefined) updateRow.description = patch.description ?? null;
      if (patch.amount !== undefined) updateRow.amount = patch.amount;
      if (patch.supplier !== undefined) updateRow.supplier = patch.supplier ?? null;
      if (patch.productId !== undefined) updateRow.product_id = patch.productId ?? null;
      if (patch.quantityPurchased !== undefined) updateRow.quantity_purchased = patch.quantityPurchased ?? null;
      if (patch.category !== undefined) {
        updateRow.category_id = await getCategoryIdByName(patch.category);
        resolvedCategory = patch.category;
      }
      if (patch.paymentMethod !== undefined) {
        const PM_MAP: Record<string, string> = {
          Cash: "cash", GCash: "gcash", "Bank Transfer": "bank_transfer", Credit: "credit",
        };
        updateRow.payment_method = PM_MAP[patch.paymentMethod] as Database["public"]["Enums"]["payment_method"];
      }
      if (patch.fundSource !== undefined) {
        updateRow.fund_source = patch.fundSource ?? null;
      }

      const { data, error } = await supabase
        .from("expenses")
        .update(updateRow)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;

      // Resolve category name from the DB if we changed it
      const categoryName = resolvedCategory ?? await getCategoryNameById(data.category_id);
      return expenseRowToApp({ ...data, categories: { name: categoryName } });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: EXPENSES_KEY }),
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: EXPENSES_KEY });
      const previous = queryClient.getQueryData<Expense[]>(EXPENSES_KEY) ?? [];
      queryClient.setQueryData<Expense[]>(
        EXPENSES_KEY,
        previous.filter((e) => e.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(EXPENSES_KEY, context.previous);
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: EXPENSES_KEY });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: EXPENSES_KEY }),
  });
}
