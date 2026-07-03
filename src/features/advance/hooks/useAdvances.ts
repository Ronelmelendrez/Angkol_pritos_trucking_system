import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { advancesTable } from "@/lib/mockData";
import type { NewCashAdvance } from "../types";

const ADVANCES_KEY = ["advances"] as const;
export const advancesKeys = {
  all: ADVANCES_KEY,
};

export function useAdvances() {
  return useQuery({
    queryKey: ADVANCES_KEY,
    queryFn: () => advancesTable.list(),
  });
}

export function useAddAdvance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewCashAdvance) => advancesTable.create({ ...input, status: "pending" }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ADVANCES_KEY }),
  });
}

export function useMarkAdvanceDeducted() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => advancesTable.update(id, { status: "deducted" }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ADVANCES_KEY }),
  });
}

export function useDeleteAdvance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => advancesTable.remove(id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ADVANCES_KEY }),
  });
}