import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { orderRowToApp, orderAppToRow, orderItemAppToRow } from "@/lib/supabaseMappers";
import type { Order, NewOrder, UpdateOrder } from "../types";
import type { Database } from "@/types/database.types";

const ORDERS_KEY = ["orders"] as const;
export const ordersKeys = {
  all: ORDERS_KEY,
};

export function useOrders() {
  return useQuery({
    queryKey: ORDERS_KEY,
    queryFn: async () => {
      const { data: orderRows, error } = await supabase
        .from("orders")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;

      const { data: itemRows } = await supabase
        .from("order_items")
        .select("*");

      const itemsByOrder = new Map<string, typeof itemRows>();
      for (const item of itemRows ?? []) {
        const list = itemsByOrder.get(item.order_id) ?? [];
        list.push(item);
        itemsByOrder.set(item.order_id, list);
      }

      return orderRows.map((row) =>
        orderRowToApp(row, itemsByOrder.get(row.id) ?? []),
      );
    },
  });
}

export function useAddOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewOrder) => {
      const { data: orderRow, error: orderErr } = await supabase
        .from("orders")
        .insert(orderAppToRow({
          date: input.date,
          customer_name: input.customerName,
          scheduled_time: input.scheduledTime,
          status: input.status,
          total: input.total,
          notes: input.notes,
          created_by: input.createdBy,
        }))
        .select()
        .single();
      if (orderErr) throw orderErr;

      if (input.items.length > 0) {
        const { error: itemsErr } = await supabase
          .from("order_items")
          .insert(input.items.map((item) => ({
            order_id: orderRow.id,
            ...orderItemAppToRow(item),
          })));
        if (itemsErr) throw itemsErr;
      }

      const { data: fullItems } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderRow.id);

      return orderRowToApp(orderRow, fullItems ?? []);
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ORDERS_KEY });
      const previous = queryClient.getQueryData<Order[]>(ORDERS_KEY) ?? [];
      const optimistic: Order = {
        ...input,
        id: `temp_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: input.items.map((item, i) => ({
          ...item,
          id: `temp_item_${Date.now()}_${i}`,
          orderId: `temp_${Date.now()}`,
        })),
      };
      queryClient.setQueryData<Order[]>(ORDERS_KEY, [optimistic, ...previous]);
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) queryClient.setQueryData(ORDERS_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ORDERS_KEY }),
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: UpdateOrder) => {
      const row: Database["public"]["Tables"]["orders"]["Update"] = {};
      if (patch.date !== undefined) row.date = patch.date;
      if (patch.scheduledTime !== undefined) row.scheduled_time = patch.scheduledTime ?? null;
      if (patch.customerName !== undefined) row.customer_name = patch.customerName;
      if (patch.status !== undefined) row.status = patch.status;
      if (patch.total !== undefined) row.total = patch.total;
      if (patch.notes !== undefined) row.notes = patch.notes ?? null;

      const { data, error } = await supabase
        .from("orders")
        .update(row)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;

      if (patch.items) {
        await supabase.from("order_items").delete().eq("order_id", id);
        if (patch.items.length > 0) {
          const { error: itemsErr } = await supabase
            .from("order_items")
            .insert(patch.items.map((item) => ({
              order_id: id,
              ...orderItemAppToRow(item),
            })));
          if (itemsErr) throw itemsErr;
        }
      }

      const { data: fullItems } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", id);

      return orderRowToApp(data, fullItems ?? []);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ORDERS_KEY }),
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("orders").delete().eq("id", id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ORDERS_KEY });
      const previous = queryClient.getQueryData<Order[]>(ORDERS_KEY) ?? [];
      queryClient.setQueryData<Order[]>(
        ORDERS_KEY,
        previous.filter((o) => o.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(ORDERS_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ORDERS_KEY }),
  });
}

export function useClaimOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("orders")
        .update({ status: "completed" })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ORDERS_KEY });
      const previous = queryClient.getQueryData<Order[]>(ORDERS_KEY) ?? [];
      queryClient.setQueryData<Order[]>(
        ORDERS_KEY,
        previous.map((o) => (o.id === id ? { ...o, status: "completed" as const } : o)),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(ORDERS_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ORDERS_KEY }),
  });
}
