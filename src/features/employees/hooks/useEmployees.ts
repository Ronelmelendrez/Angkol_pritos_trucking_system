import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { employeeRowToApp, employeeAppToRow } from "@/lib/supabaseMappers";
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
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .order("name");
      if (error) throw error;
      return data.map(employeeRowToApp);
    },
  });
}

export function useAddEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewEmployee) => {
      const row = employeeAppToRow({
        ...input,
        avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      });
      const { data, error } = await supabase
        .from("employees")
        .insert(row)
        .select()
        .single();
      if (error) throw error;
      return employeeRowToApp(data);
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: EMPLOYEES_KEY });
      const previous = queryClient.getQueryData<Employee[]>(EMPLOYEES_KEY) ?? [];
      const optimistic: Employee = {
        ...input,
        id: `temp_${Date.now()}`,
        avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      queryClient.setQueryData<Employee[]>(EMPLOYEES_KEY, [...previous, optimistic]);
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) queryClient.setQueryData(EMPLOYEES_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEY }),
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: UpdateEmployee) => {
      const row = employeeAppToRow({ ...patch, phone: patch.phone ?? "", avatarColor: "", payFrequency: patch.payFrequency ?? "semi_monthly" });
      const { data, error } = await supabase
        .from("employees")
        .update(row)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return employeeRowToApp(data);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEY }),
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employees").delete().eq("id", id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: EMPLOYEES_KEY });
      const previous = queryClient.getQueryData<Employee[]>(EMPLOYEES_KEY) ?? [];
      queryClient.setQueryData<Employee[]>(
        EMPLOYEES_KEY,
        previous.filter((e) => e.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(EMPLOYEES_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEY }),
  });
}

export type { Employee };
