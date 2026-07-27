import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { payrollRunRowToApp } from "@/lib/supabaseMappers";
import { getEmployeeNameById } from "@/features/employees/hooks/useEmployees";

export const PAYROLL_KEY = ["payroll_runs"] as const;

export function usePayrollHistory() {
  return useQuery({
    queryKey: PAYROLL_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payroll_runs")
        .select("*")
        .order("period_end", { ascending: false });
      if (error) throw error;
      return Promise.all(data.map(async (row) => {
        const employeeName = await getEmployeeNameById(row.employee_id);
        return payrollRunRowToApp({ ...row, employees: { name: employeeName } });
      }));
    },
  });
}
