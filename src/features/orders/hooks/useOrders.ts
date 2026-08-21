import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { orderRowToApp, orderAppToRow, orderItemAppToRow } from "@/lib/supabaseMappers";
import { todayISO } from "@/utils/date";
import { salesKeys } from "@/features/sales/hooks/useSales";
import type { Database } from "@/types/database.types";
import type { Order, NewOrder, UpdateOrder } from "../types";

const ORDERS_KEY = ["orders"] as const;
export const ordersKeys = {
  all: ORDERS_KEY,
};

async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `SO-${year}-`;

  const { data } = await supabase
    .from("orders")
    .select("order_number")
    .like("order_number", `${prefix}%`)
    .order("order_number", { ascending: false })
    .limit(1);

  if (!data || data.length === 0) {
    return `${prefix}000001`;
  }

  const last = (data[0] as Record<string, unknown>).order_number as string;
  const match = last.match(/(\d+)$/);
  const nextNum = match ? parseInt(match[1], 10) + 1 : 1;
  return `${prefix}${String(nextNum).padStart(6, "0")}`;
}

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
      const orderNumber = input.orderNumber || await generateOrderNumber();

      const { data: orderRow, error: orderErr } = await supabase
        .from("orders")
        .insert(orderAppToRow({
          date: input.date,
          customer_name: input.customerName,
          contact_number: input.contactNumber,
          order_number: orderNumber,
          scheduled_time: input.scheduledTime,
          status: input.status,
          total: input.total,
          deposit_amount: input.depositAmount,
          balance_amount: input.balanceAmount,
          cancel_reason: input.cancelReason,
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

      // Auto-create deposit payment record if deposit > 0.
      // payment_date = today because the cash is received now, not on the pick-up date.
      if (input.depositAmount > 0) {
        const { error: depErr } = await supabase
          .from("scheduled_order_payments")
          .insert({
            order_id: orderRow.id,
            payment_type: "deposit",
            amount: input.depositAmount,
            payment_date: todayISO(),
            created_by: input.createdBy ?? null,
          });
        if (depErr) throw depErr;
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
      const tempId = `temp_${Date.now()}`;
      const optimistic: Order = {
        id: tempId,
        orderNumber: input.orderNumber || "SO-000000",
        date: input.date,
        scheduledTime: input.scheduledTime,
        customerName: input.customerName,
        contactNumber: input.contactNumber,
        status: input.status,
        total: input.total,
        depositAmount: input.depositAmount,
        balanceAmount: input.balanceAmount,
        cancelReason: input.cancelReason,
        notes: input.notes,
        createdBy: input.createdBy,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: input.items.map((item, i) => ({
          ...item,
          id: `temp_item_${Date.now()}_${i}`,
          orderId: tempId,
        })),
      };
      queryClient.setQueryData<Order[]>(ORDERS_KEY, [optimistic, ...previous]);
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) queryClient.setQueryData(ORDERS_KEY, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_KEY });
      queryClient.invalidateQueries({ queryKey: ["order-payments"] });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: UpdateOrder) => {
      const row: Database["public"]["Tables"]["orders"]["Update"] = {};
      if (patch.orderNumber !== undefined) row.order_number = patch.orderNumber;
      if (patch.date !== undefined) row.date = patch.date;
      if (patch.scheduledTime !== undefined) row.scheduled_time = patch.scheduledTime ?? null;
      if (patch.customerName !== undefined) row.customer_name = patch.customerName;
      if (patch.contactNumber !== undefined) row.contact_number = patch.contactNumber;
      if (patch.status !== undefined) row.status = patch.status;
      if (patch.total !== undefined) row.total = patch.total;
      if (patch.depositAmount !== undefined) row.deposit_amount = patch.depositAmount;
      if (patch.balanceAmount !== undefined) row.balance_amount = patch.balanceAmount;
      if (patch.cancelReason !== undefined) row.cancel_reason = patch.cancelReason ?? null;
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

export function useCompleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (order: Order) => {
      // A completed order is an actual sale: record its items dated the
      // pick-up date. The daily cash report ignores these rows and instead
      // counts only the deposit/balance payments actually received.
      if (order.items.length > 0) {
        const { error: salesErr } = await supabase
          .from("sales")
          .insert(
            order.items.map((item) => ({
              date: order.date,
              product_id: item.productId,
              quantity_sold: item.quantity,
              unit_price: item.unitPrice,
              amount: item.amount,
              notes: `Scheduled order ${order.orderNumber}`,
              order_id: order.id,
            })),
          );
        if (salesErr) throw salesErr;
      }

      const { data, error } = await supabase
        .from("orders")
        .update({ status: "completed" })
        .eq("id", order.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onMutate: async (order) => {
      await queryClient.cancelQueries({ queryKey: ORDERS_KEY });
      const previous = queryClient.getQueryData<Order[]>(ORDERS_KEY) ?? [];
      queryClient.setQueryData<Order[]>(
        ORDERS_KEY,
        previous.map((o) => (o.id === order.id ? { ...o, status: "completed" as const } : o)),
      );
      return { previous };
    },
    onError: (_err, _order, context) => {
      if (context?.previous) queryClient.setQueryData(ORDERS_KEY, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_KEY });
      queryClient.invalidateQueries({ queryKey: salesKeys.all });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data, error } = await supabase
        .from("orders")
        .update({ status: "cancelled", cancel_reason: reason })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, reason }) => {
      await queryClient.cancelQueries({ queryKey: ORDERS_KEY });
      const previous = queryClient.getQueryData<Order[]>(ORDERS_KEY) ?? [];
      queryClient.setQueryData<Order[]>(
        ORDERS_KEY,
        previous.map((o) =>
          o.id === id ? { ...o, status: "cancelled" as const, cancelReason: reason } : o
        ),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(ORDERS_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ORDERS_KEY }),
  });
}
