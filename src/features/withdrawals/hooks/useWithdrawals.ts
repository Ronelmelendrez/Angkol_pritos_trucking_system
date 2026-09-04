import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { ownerWithdrawalRowToApp, ownerWithdrawalAppToRow } from "@/lib/supabaseMappers";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { NewOwnerWithdrawal } from "../types";

export const withdrawalsKeys = {
  all: ["owner_withdrawals"] as const,
  byBranch: (branchId: string) => ["owner_withdrawals", branchId] as const,
};

export function useOwnerWithdrawals(branchId?: string) {
  return useQuery({
    queryKey: branchId ? withdrawalsKeys.byBranch(branchId) : withdrawalsKeys.all,
    queryFn: async () => {
      let query = supabase
        .from("owner_withdrawals")
        .select("*")
        .order("date", { ascending: false });

      if (branchId) {
        query = query.eq("branch_id", branchId);
      }

      const { data, error } = await query;
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
        branch_id: input.branchId,
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
    onSettled: () => queryClient.invalidateQueries({ queryKey: withdrawalsKeys.all }),
  });
}

export function useDeleteOwnerWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("owner_withdrawals").delete().eq("id", id);
      if (error) throw error;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: withdrawalsKeys.all }),
  });
}
