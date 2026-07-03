import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeesTable } from "@/lib/mockData";
import type { Employee, NewEmployee, UpdateEmployee } from "../types";

const EMPLOYEES_KEY = ["employees"] as const;
export const employeesKeys = {
  all: EMPLOYEES_KEY,
  active: ["employees", "active"] as const,
};
const AVATAR_COLORS = ["#E67E22", "#C0392B", "#F1C40F", "#8D6E63", "#D35400", "#6D4C41"];

export function useEmployees() {
  return useQuery({
    queryKey: EMPLOYEES_KEY,
    queryFn: () => employeesTable.list(),
  });
}

export function useAddEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewEmployee) =>
      employeesTable.create({
        ...input,
        avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEY }),
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: UpdateEmployee) => employeesTable.update(id, patch),
    onSettled: () => queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEY }),
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeesTable.remove(id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEY }),
  });
}

export type { Employee };