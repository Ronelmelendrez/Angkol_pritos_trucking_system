import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { payRuleRowToApp, overrideRowToApp } from "@/lib/supabaseMappers";
import type { Database } from "@/types/database.types";
import type { NewPayRuleSettings, SetEmployeePayOverride } from "../types";

const GLOBAL_KEY = ["pay_rule_settings"] as const;
const ALL_OVERRIDES_KEY = ["employee_pay_overrides"] as const;
const OVERRIDE_KEY = (id: string) => ["employee_pay_override", id] as const;

export function usePayRuleSettings() {
  return useQuery({
    queryKey: GLOBAL_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pay_rule_settings")
        .select("*")
        .eq("id", "global")
        .single();
      if (error) throw error;
      return payRuleRowToApp(data);
    },
  });
}

export function useUpdatePayRuleSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewPayRuleSettings) => {
      const { data, error } = await supabase
        .from("pay_rule_settings")
        .update({
          default_reorder_threshold: input.defaultReorderThreshold,
          default_opening_cash: input.defaultOpeningCash,
          spoilage_rate_threshold: input.spoilageRateThreshold,
          standard_hours_per_day: input.standardHoursPerDay,
          half_day_threshold_hours: input.halfDayThresholdHours,
          half_day_rate_multiplier: input.halfDayRateMultiplier,
          late_grace_minutes: input.lateGraceMinutes,
          late_deduction_per_minute: input.lateDeductionPerMinute,
          absence_deduction_mode: input.absenceDeductionMode,
          rest_day_rate_multiplier: input.restDayRateMultiplier,
          holiday_rate_multiplier: input.holidayRateMultiplier,
          night_differential_percent: input.nightDifferentialPercent,
          round_hours_to: input.roundHoursTo,
          payday_rules: input.paydayRules as unknown as Database["public"]["Tables"]["pay_rule_settings"]["Insert"]["payday_rules"],
        })
        .eq("id", "global")
        .select()
        .single();
      if (error) throw error;
      return payRuleRowToApp(data);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: GLOBAL_KEY }),
  });
}

export function useAllEmployeePayOverrides() {
  return useQuery({
    queryKey: ALL_OVERRIDES_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_pay_overrides")
        .select("*");
      if (error) throw error;
      return data.map(overrideRowToApp);
    },
  });
}

export function useEmployeePayOverride(employeeId: string) {
  return useQuery({
    queryKey: OVERRIDE_KEY(employeeId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_pay_overrides")
        .select("*")
        .eq("employee_id", employeeId)
        .maybeSingle();
      if (error) throw error;
      return data ? overrideRowToApp(data) : null;
    },
  });
}

export function useSetEmployeePayOverride() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: SetEmployeePayOverride) => {
      // Check for existing override
      const { data: existing } = await supabase
        .from("employee_pay_overrides")
        .select("id")
        .eq("employee_id", input.employeeId)
        .maybeSingle();

      const row = {
        employee_id: input.employeeId,
        half_day_rate_multiplier: input.halfDayRateMultiplier ?? null,
        late_deduction_per_minute: input.lateDeductionPerMinute ?? null,
      };

      if (existing) {
        const { data, error } = await supabase
          .from("employee_pay_overrides")
          .update(row)
          .eq("id", existing.id)
          .select()
          .single();
        if (error) throw error;
        return overrideRowToApp(data);
      }

      const { data, error } = await supabase
        .from("employee_pay_overrides")
        .insert(row)
        .select()
        .single();
      if (error) throw error;
      return overrideRowToApp(data);
    },
    onSettled: (_data, _error, vars) =>
      queryClient.invalidateQueries({ queryKey: OVERRIDE_KEY(vars.employeeId) }),
  });
}
