import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { ownerWithdrawalRowToApp, ownerWithdrawalAppToRow } from "@/lib/supabaseMappers";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { NewOwnerWithdrawal } from "../types";

const WITHDRAWALS_KEY = ["owner_withdrawals"] as const;
export const withdrawalsKeys = {
  all: WITHDRAWALS_KEY,
};

export function useOwnerWithdrawals() {
  return useQuery({
    queryKey: WITHDRAWALS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("owner_withdrawals")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data.map(ownerWithdrawalRowToApp);
    },
  });
}

export function useAddOwnerWithdrawal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: NewOwnerWithdrawal) => {
      const payload = ownerWithdrawalAppToRow({
        date: input.date,
        amount: input.amount,
        reason: input.reason,
        createdBy: user?.id,
      });
      const { data, error } = await supabase
        .from("owner_withdrawals")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return ownerWithdrawalRowToApp(data);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: WITHDRAWALS_KEY }),
  });
}

export function useDeleteOwnerWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("owner_withdrawals").delete().eq("id", id);
      if (error) throw error;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: WITHDRAWALS_KEY }),
  });
}
