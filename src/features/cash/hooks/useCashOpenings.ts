import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { cashOpeningRowToApp, cashOpeningAppToRow } from "@/lib/supabaseMappers";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { CashOpening, NewCashOpening } from "../types";

export const cashOpeningsKeys = {
  all: ["cash_openings"] as const,
  byBranch: (branchId: string) => ["cash_openings", branchId] as const,
};

export function useCashOpenings(branchId?: string) {
  const { user } = useAuth();
  const resolvedBranchId = branchId ?? user?.branchId ?? "";

  return useQuery({
    queryKey: resolvedBranchId ? cashOpeningsKeys.byBranch(resolvedBranchId) : cashOpeningsKeys.all,
    queryFn: async () => {
      let query = supabase
        .from("cash_openings")
        .select("*")
        .order("date", { ascending: false });

      if (resolvedBranchId) {
        query = query.eq("branch_id", resolvedBranchId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data.map(cashOpeningRowToApp);
    },
    enabled: !!resolvedBranchId,
  });
}

export function useUpsertCashOpening() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: NewCashOpening) => {
      const payload = cashOpeningAppToRow({
        date: input.date,
        openingCash: input.openingCash,
        branchId: input.branchId,
        createdBy: user?.id,
      });
      const { data, error } = await supabase
        .from("cash_openings")
        .upsert(payload, { onConflict: "date,branch_id" })
        .select()
        .single();
      if (error) throw error;
      return cashOpeningRowToApp(data);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: cashOpeningsKeys.all }),
  });
}

export type { CashOpening };
