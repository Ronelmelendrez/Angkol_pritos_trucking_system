import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { cashCountRowToApp, cashCountAppToRow } from "@/lib/supabaseMappers";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { CashCount, NewCashCount } from "../types";

export const cashCountsKeys = {
  all: ["cash_counts"] as const,
  byBranch: (branchId: string) => ["cash_counts", branchId] as const,
};

export function useCashCounts(branchId?: string) {
  const { user } = useAuth();
  const resolvedBranchId = branchId ?? user?.branchId ?? "";

  return useQuery({
    queryKey: resolvedBranchId ? cashCountsKeys.byBranch(resolvedBranchId) : cashCountsKeys.all,
    queryFn: async () => {
      let query = supabase
        .from("cash_counts")
        .select("*")
        .order("date", { ascending: false });

      if (resolvedBranchId) {
        query = query.eq("branch_id", resolvedBranchId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data.map(cashCountRowToApp);
    },
    enabled: !!resolvedBranchId,
  });
}

export function useUpsertCashCount() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: NewCashCount) => {
      const payload = cashCountAppToRow({
        date: input.date,
        expectedCash: input.expectedCash,
        actualCash: input.actualCash,
        difference: input.difference,
        branchId: input.branchId,
        remarks: input.remarks,
        countedBy: user?.id,
      });
      const { data, error } = await supabase
        .from("cash_counts")
        .upsert(payload, { onConflict: "date,branch_id" })
        .select()
        .single();
      if (error) throw error;
      return cashCountRowToApp(data);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: cashCountsKeys.all }),
  });
}

export type { CashCount };
