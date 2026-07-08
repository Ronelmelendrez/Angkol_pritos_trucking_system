import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { payRuleSettingsTable, employeePayOverridesTable } from "@/lib/mockData";
import type { NewPayRuleSettings, EmployeePayOverride, SetEmployeePayOverride } from "../types";

const GLOBAL_KEY = ["pay_rule_settings"] as const;
const ALL_OVERRIDES_KEY = ["employee_pay_overrides"] as const;
const OVERRIDE_KEY = (id: string) => ["employee_pay_override", id] as const;

export function usePayRuleSettings() {
  return useQuery({
    queryKey: GLOBAL_KEY,
    queryFn: () => {
      const rows = payRuleSettingsTable.list();
      return rows[0];
    },
  });
}

export function useUpdatePayRuleSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewPayRuleSettings) =>
      payRuleSettingsTable.update("global", input),
    onSettled: () => queryClient.invalidateQueries({ queryKey: GLOBAL_KEY }),
  });
}

export function useAllEmployeePayOverrides() {
  return useQuery({
    queryKey: ALL_OVERRIDES_KEY,
    queryFn: () => employeePayOverridesTable.list(),
  });
}

export function useEmployeePayOverride(employeeId: string) {
  return useQuery({
    queryKey: OVERRIDE_KEY(employeeId),
    queryFn: () => {
      const rows = employeePayOverridesTable.list();
      return rows.find((r) => r.employeeId === employeeId) ?? null;
    },
  });
}

export function useSetEmployeePayOverride() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: SetEmployeePayOverride) => {
      const rows = employeePayOverridesTable.list();
      const existing = rows.find((r) => r.employeeId === input.employeeId);
      if (existing) {
        return employeePayOverridesTable.update(existing.id, input);
      }
      return employeePayOverridesTable.create(input);
    },
    onSettled: (_data, _error, vars) =>
      queryClient.invalidateQueries({ queryKey: OVERRIDE_KEY(vars.employeeId) }),
  });
}
