import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { employeeRowToApp, employeeAppToRow } from "@/lib/supabaseMappers";
import type { Employee, NewEmployee, UpdateEmployee } from "../types";
import { useAuth } from "@/features/auth/hooks/useAuth";

import type { Database } from "@/types/database.types";

const EMPLOYEES_KEY = ["employees"] as const;
export const employeesKeys = {
  all: EMPLOYEES_KEY,
  active: ["employees", "active"] as const,
  byBranch: (branchId: string) => ["employees", "branch", branchId] as const,
};
const AVATAR_COLORS = ["#E67E22", "#C0392B", "#F1C40F", "#8D6E63", "#D35400", "#6D4C41"];

const empNameCache = new Map<string, string>();

export async function getEmployeeNameById(id: string): Promise<string> {
  const cached = empNameCache.get(id);
  if (cached) return cached;

  const { data, error } = await supabase
    .from("employees")
    .select("name")
    .eq("id", id)
    .single();

  if (error || !data) return "Unknown";
  empNameCache.set(id, data.name);
  return data.name;
}

export function useEmployees() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: user?.role === "manager" ? EMPLOYEES_KEY : employeesKeys.byBranch(user?.branchId ?? ""),
    queryFn: async () => {
      let query = supabase.from("employees").select("*").order("name");
      
      // For staff users, filter by their branch
      if (user?.role === "staff" && user?.branchId) {
        query = query.eq("branch_id", user.branchId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data.map(employeeRowToApp);
    },
    enabled: !(user?.role === "staff" && !user?.branchId), // Don't fetch if staff has no branch
  });
}

export function useAllEmployees() {
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

export function useBranchEmployeeCount(branchId: string | null) {
  return useQuery({
    queryKey: ["employees", "count", "branch", branchId ?? ""],
    enabled: !!branchId,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("employees")
        .select("id", { count: "exact", head: true })
        .eq("branch_id", branchId ?? "");
      if (error) throw error;
      return count ?? 0;
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
      const row: Database["public"]["Tables"]["employees"]["Update"] = {};
      if (patch.name !== undefined) row.name = patch.name;
      if (patch.phone !== undefined) row.phone = patch.phone;
      if (patch.dailyRate !== undefined) row.daily_rate = patch.dailyRate;
      if (patch.hireDate !== undefined) row.hire_date = patch.hireDate;
      if (patch.isActive !== undefined) row.is_active = patch.isActive;
      if (patch.payFrequency !== undefined) row.pay_frequency = patch.payFrequency as Database["public"]["Enums"]["pay_frequency"];
      if (patch.branchId !== undefined) row.branch_id = patch.branchId;
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
