import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { advanceRowToApp } from "@/lib/supabaseMappers";
import type { NewCashAdvance } from "../types";

const ADVANCES_KEY = ["advances"] as const;
export const advancesKeys = {
  all: ADVANCES_KEY,
};

export function useAdvances() {
  return useQuery({
    queryKey: ADVANCES_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cash_advances")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data.map(advanceRowToApp);
    },
  });
}

export function useAddAdvance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewCashAdvance) => {
      const { data, error } = await supabase
        .from("cash_advances")
        .insert({
          employee_id: input.employeeId,
          amount: input.amount,
          date: input.date,
          reason: input.reason ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return advanceRowToApp(data);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ADVANCES_KEY }),
  });
}

export function useMarkAdvanceDeducted() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("cash_advances")
        .update({ status: "deducted" })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return advanceRowToApp(data);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ADVANCES_KEY }),
  });
}

export function useDeleteAdvance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cash_advances").delete().eq("id", id);
      if (error) throw error;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ADVANCES_KEY }),
  });
}
