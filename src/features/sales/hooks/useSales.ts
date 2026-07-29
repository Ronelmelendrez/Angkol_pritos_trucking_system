import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { saleRowToApp, saleAppToRow } from "@/lib/supabaseMappers";
import type { Sale, NewSale, UpdateSale } from "../types";

const SALES_KEY = ["sales"] as const;
export const salesKeys = {
  all: SALES_KEY,
};

export function useSales() {
  return useQuery({
    queryKey: SALES_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data.map(saleRowToApp);
    },
  });
}

export function useAddSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewSale) => {
      const { data, error } = await supabase
        .from("sales")
        .insert(saleAppToRow({
          date: input.date,
          product_id: input.productId,
          quantity_sold: input.quantitySold,
          unit_price: input.unitPrice,
          amount: input.amount,
          notes: input.notes,
        }))
        .select()
        .single();
      if (error) throw error;
      return saleRowToApp(data);
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: SALES_KEY });
      const previous = queryClient.getQueryData<Sale[]>(SALES_KEY) ?? [];
      const optimistic: Sale = {
        ...input,
        id: `temp_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      queryClient.setQueryData<Sale[]>(SALES_KEY, [optimistic, ...previous]);
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) queryClient.setQueryData(SALES_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: SALES_KEY }),
  });
}

export function useUpdateSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: UpdateSale) => {
      const row: Record<string, unknown> = {};
      if (patch.date !== undefined) row.date = patch.date;
      if (patch.productId !== undefined) row.product_id = patch.productId;
      if (patch.quantitySold !== undefined) row.quantity_sold = patch.quantitySold;
      if (patch.unitPrice !== undefined) row.unit_price = patch.unitPrice;
      if (patch.amount !== undefined) row.amount = patch.amount;
      if (patch.notes !== undefined) row.notes = patch.notes ?? null;

      const { data, error } = await supabase
        .from("sales")
        .update(row)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return saleRowToApp(data);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: SALES_KEY }),
  });
}

export function useDeleteSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sales").delete().eq("id", id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: SALES_KEY });
      const previous = queryClient.getQueryData<Sale[]>(SALES_KEY) ?? [];
      queryClient.setQueryData<Sale[]>(
        SALES_KEY,
        previous.filter((s) => s.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(SALES_KEY, context.previous);
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: SALES_KEY });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: SALES_KEY }),
  });
}
