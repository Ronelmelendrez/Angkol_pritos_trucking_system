import { useQuery } from "@tanstack/react-query";
import { payrollRunsTable } from "@/lib/mockData";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import { useMemo } from "react";

export const PAYROLL_KEY = ["payroll_runs"] as const;

export function usePayrollHistory() {
  const { data: employees = [] } = useEmployees();

  const query = useQuery({
    queryKey: PAYROLL_KEY,
    queryFn: () => payrollRunsTable.list(),
  });

  const data = useMemo(() => {
    const employeeMap = new Map(employees.map((e) => [e.id, e.name]));
    return (query.data ?? []).map((run) => ({
      ...run,
      employeeName: employeeMap.get(run.employeeId) ?? "Unknown",
    }));
  }, [query.data, employees]);

  return { ...query, data };
}
