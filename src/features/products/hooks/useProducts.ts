import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { productRowToApp, productAppToRow } from "@/lib/supabaseMappers";
import type { Product, NewProduct, UpdateProduct } from "../types";

const PRODUCTS_KEY = ["products"] as const;
export const productsKeys = {
  all: PRODUCTS_KEY,
};

export function useProducts() {
  return useQuery({
    queryKey: PRODUCTS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name");
      if (error) throw error;
      return data.map(productRowToApp);
    },
  });
}

export function useAddProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewProduct) => {
      const { data, error } = await supabase
        .from("products")
        .insert(productAppToRow(input))
        .select()
        .single();
      if (error) throw error;
      return productRowToApp(data);
    },
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
    mutationFn: async ({ id, ...patch }: UpdateProduct) => {
      const { data, error } = await supabase
        .from("products")
        .update(productAppToRow(patch as NewProduct))
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return productRowToApp(data);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: PRODUCTS_KEY });
      const previous = queryClient.getQueryData<Product[]>(PRODUCTS_KEY) ?? [];
      queryClient.setQueryData<Product[]>(
        PRODUCTS_KEY,
        previous.filter((p) => p.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(PRODUCTS_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
}
