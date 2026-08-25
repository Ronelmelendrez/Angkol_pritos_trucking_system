import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { branchRowToApp, branchAppToRow } from "@/lib/supabaseMappers";
import type { Branch, NewBranch, UpdateBranch } from "../types";

const BRANCHES_KEY = ["branches"] as const;

export function useBranches() {
  return useQuery({
    queryKey: BRANCHES_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .order("name");
      if (error) throw error;
      return data.map(branchRowToApp);
    },
  });
}

export function useActiveBranches() {
  return useQuery({
    queryKey: ["branches", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data.map(branchRowToApp);
    },
  });
}

export function useBranchById(id: string) {
  return useQuery({
    queryKey: ["branches", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return branchRowToApp(data);
    },
  });
}

export function useBranchStaffEmail(branchId: string) {
  return useQuery({
    queryKey: ["branches", branchId, "staff-email"],
    enabled: !!branchId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("email")
        .eq("branch_id", branchId)
        .eq("role", "staff")
        .limit(1)
        .single();
      if (error) return null;
      return data?.email ?? null;
    },
  });
}

export function useBranchMap() {
  return useQuery({
    queryKey: ["branches", "map"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branches")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return Object.fromEntries(data.map((b) => [b.id, b.name]));
    },
  });
}

export function useCheckEmailExists(email: string) {
  return useQuery({
    queryKey: ["profiles", "check-email", email],
    enabled: !!email,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
  });
}

export function useAddBranchWithStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewBranch & { branchEmail: string; branchPassword: string }) => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      const response = await fetch(`${supabaseUrl}/functions/v1/create-branch-with-staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to create branch');
      }

      return {
        branch: data.branch,
        credentials: data.credentials,
      };
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: BRANCHES_KEY }),
  });
}

export function useResetBranchPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    },
  });
}

export function useAddBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewBranch) => {
      const row = branchAppToRow(input);
      const { data, error } = await supabase
        .from("branches")
        .insert(row)
        .select()
        .single();
      if (error) throw error;
      return branchRowToApp(data);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: BRANCHES_KEY }),
  });
}

export function useUpdateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: UpdateBranch) => {
      const row: Partial<BranchRow> = {};
      if (patch.name !== undefined) row.name = patch.name;
      if (patch.address !== undefined) row.address = patch.address;
      if (patch.phone !== undefined) row.phone = patch.phone;
      if (patch.isActive !== undefined) row.is_active = patch.isActive;

      const { data, error } = await supabase
        .from("branches")
        .update(row)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return branchRowToApp(data);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: BRANCHES_KEY }),
  });
}

export function useDeleteBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("branches").delete().eq("id", id);
      if (error) throw error;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: BRANCHES_KEY }),
  });
}

type BranchRow = Database["public"]["Tables"]["branches"]["Row"];

import type { Database } from "@/types/database.types";