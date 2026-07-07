import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsTable } from "@/lib/mockData";
import type { Product, NewProduct, UpdateProduct } from "../types";

const PRODUCTS_KEY = ["products"] as const;
export const productsKeys = {
  all: PRODUCTS_KEY,
};

export function useProducts() {
  return useQuery({
    queryKey: PRODUCTS_KEY,
    queryFn: () => productsTable.list(),
  });
}

export function useAddProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewProduct) => productsTable.create(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: PRODUCTS_KEY });
      const previous = queryClient.getQueryData<Product[]>(PRODUCTS_KEY) ?? [];
      const optimistic: Product = {
        ...input,
        id: `temp_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      queryClient.setQueryData<Product[]>(PRODUCTS_KEY, [optimistic, ...previous]);
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) queryClient.setQueryData(PRODUCTS_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: UpdateProduct) => productsTable.update(id, patch),
    onSettled: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsTable.remove(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: PRODUCTS_KEY });
      const previous = queryClient.getQueryData<Product[]>(PRODUCTS_KEY) ?? [];
      queryClient.setQueryData<Product[]>(
        PRODUCTS_KEY,
        previous.filter((p) => p.id !== id)
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(PRODUCTS_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
}
