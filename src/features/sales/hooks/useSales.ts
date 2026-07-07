import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { salesTable } from "@/lib/mockData";
import type { Sale, NewSale, UpdateSale } from "../types";

const SALES_KEY = ["sales"] as const;
export const salesKeys = {
  all: SALES_KEY,
};

export function useSales() {
  return useQuery({
    queryKey: SALES_KEY,
    queryFn: () => salesTable.list(),
  });
}

export function useAddSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewSale) => salesTable.create(input),
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
    mutationFn: ({ id, ...patch }: UpdateSale) => salesTable.update(id, patch),
    onSettled: () => queryClient.invalidateQueries({ queryKey: SALES_KEY }),
  });
}

export function useDeleteSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => salesTable.remove(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: SALES_KEY });
      const previous = queryClient.getQueryData<Sale[]>(SALES_KEY) ?? [];
      queryClient.setQueryData<Sale[]>(
        SALES_KEY,
        previous.filter((s) => s.id !== id)
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(SALES_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: SALES_KEY }),
  });
}
