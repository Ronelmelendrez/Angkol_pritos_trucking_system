import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { cashOpeningRowToApp, cashOpeningAppToRow } from "@/lib/supabaseMappers";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { CashOpening, NewCashOpening } from "../types";

const OPENINGS_KEY = ["cash_openings"] as const;
export const cashOpeningsKeys = {
  all: OPENINGS_KEY,
};

export function useCashOpenings() {
  return useQuery({
    queryKey: OPENINGS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cash_openings")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data.map(cashOpeningRowToApp);
    },
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
        createdBy: user?.id,
      });
      const { data, error } = await supabase
        .from("cash_openings")
        .upsert(payload, { onConflict: "date" })
        .select()
        .single();
      if (error) throw error;
      return cashOpeningRowToApp(data);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: OPENINGS_KEY }),
  });
}

export type { CashOpening };
