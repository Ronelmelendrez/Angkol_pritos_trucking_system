import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { orderPaymentRowToApp, orderPaymentAppToRow } from "@/lib/supabaseMappers";
import type { OrderPayment, NewOrderPayment } from "../types";

const ORDER_PAYMENTS_KEY = ["order-payments"] as const;
const ALL_ORDER_PAYMENTS_KEY = ["order-payments", "all"] as const;

function byOrderKey(orderId: string) {
  return [...ORDER_PAYMENTS_KEY, orderId] as const;
}

export function useAllOrderPayments() {
  return useQuery({
    queryKey: ALL_ORDER_PAYMENTS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scheduled_order_payments")
        .select("*")
        .order("payment_date", { ascending: false });
      if (error) throw error;
      return data.map(orderPaymentRowToApp);
    },
  });
}

export function useOrderPayments(orderId: string | null) {
  return useQuery({
    queryKey: orderId ? byOrderKey(orderId) : ORDER_PAYMENTS_KEY,
    enabled: !!orderId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scheduled_order_payments")
        .select("*")
        .eq("order_id", orderId!)
        .order("payment_date", { ascending: true });
      if (error) throw error;
      return data.map(orderPaymentRowToApp);
    },
  });
}

export function useAddOrderPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewOrderPayment) => {
      const { data, error } = await supabase
        .from("scheduled_order_payments")
        .insert(orderPaymentAppToRow({
          order_id: input.orderId,
          payment_type: input.paymentType,
          amount: input.amount,
          payment_date: input.paymentDate,
          notes: input.notes,
          created_by: input.createdBy,
        }))
        .select()
        .single();
      if (error) throw error;
      return orderPaymentRowToApp(data);
    },
    onMutate: async (input) => {
      const key = byOrderKey(input.orderId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<OrderPayment[]>(key) ?? [];
      const optimistic: OrderPayment = {
        id: `temp_${Date.now()}`,
        orderId: input.orderId,
        paymentType: input.paymentType,
        amount: input.amount,
        paymentDate: input.paymentDate,
        notes: input.notes,
        createdBy: input.createdBy,
        createdAt: new Date().toISOString(),
      };
      queryClient.setQueryData<OrderPayment[]>(key, [...previous, optimistic]);
      return { previous, orderId: input.orderId };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(byOrderKey(context.orderId), context.previous);
      }
    },
    onSettled: (_data, _err, input) => {
      queryClient.invalidateQueries({ queryKey: byOrderKey(input.orderId) });
      queryClient.invalidateQueries({ queryKey: ORDER_PAYMENTS_KEY });
    },
  });
}

export function useDeleteOrderPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; orderId: string }) => {
      const { error } = await supabase
        .from("scheduled_order_payments")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, orderId }) => {
      const key = byOrderKey(orderId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<OrderPayment[]>(key) ?? [];
      queryClient.setQueryData<OrderPayment[]>(key, previous.filter((p) => p.id !== id));
      return { previous, orderId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(byOrderKey(context.orderId), context.previous);
      }
    },
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: byOrderKey(vars.orderId) });
      queryClient.invalidateQueries({ queryKey: ORDER_PAYMENTS_KEY });
    },
  });
}
