import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { payrollRunRowToApp } from "@/lib/supabaseMappers";

export const PAYROLL_KEY = ["payroll_runs"] as const;

export function usePayrollHistory() {
  return useQuery({
    queryKey: PAYROLL_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payroll_runs")
        .select("*, employees!payroll_runs_employee_id_fkey(name)")
        .order("period_end", { ascending: false });
      if (error) throw error;
      return data.map((row) => payrollRunRowToApp(row));
    },
  });
}
