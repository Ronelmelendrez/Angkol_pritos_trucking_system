import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabaseClient"
import type { Employee } from "@/types"

export const employeesKeys = {
  all: ["employees"] as const,
  active: ["employees", "active"] as const,
}

async function fetchEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .order("name", { ascending: true })

  if (error) throw error
  return (data ?? []) as Employee[]
}

export function useEmployees() {
  return useQuery({
    queryKey: employeesKeys.all,
    queryFn: fetchEmployees,
  })
}