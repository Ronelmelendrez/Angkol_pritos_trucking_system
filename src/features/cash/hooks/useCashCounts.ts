import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { cashCountRowToApp, cashCountAppToRow } from "@/lib/supabaseMappers";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { CashCount, NewCashCount } from "../types";

const COUNTS_KEY = ["cash_counts"] as const;
export const cashCountsKeys = {
  all: COUNTS_KEY,
};

export function useCashCounts() {
  return useQuery({
    queryKey: COUNTS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cash_counts")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data.map(cashCountRowToApp);
    },
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
        remarks: input.remarks,
        countedBy: user?.id,
      });
      const { data, error } = await supabase
        .from("cash_counts")
        .upsert(payload, { onConflict: "date" })
        .select()
        .single();
      if (error) throw error;
      return cashCountRowToApp(data);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: COUNTS_KEY }),
  });
}

export type { CashCount };
