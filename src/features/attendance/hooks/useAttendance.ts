import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { attendanceRowToApp } from "@/lib/supabaseMappers";
import { hoursBetween, localISO, nowISO, todayISO } from "@/utils/date";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import type { AttendanceRecord, AttendanceStatus, ShiftType } from "../types";
import type { Database } from "@/types/database.types";

const ATTENDANCE_KEY = ["attendance"] as const;
export const attendanceKeys = {
  all: ATTENDANCE_KEY,
  byBranch: (branchId: string) => ["attendance", "branch", branchId] as const,
};

function detectShift(clockOut: string): ShiftType {
  const hour = new Date(clockOut).getHours();
  return hour < 13 || (hour === 13 && new Date(clockOut).getMinutes() < 30) ? "half" : "full";
}

export function useAttendance() {
  const { user } = useAuth();
  const { data: branchEmployees } = useEmployees();
  const branchEmployeeIds = branchEmployees?.map((e) => e.id) ?? [];

  return useQuery({
    queryKey: user?.role === "manager" ? ATTENDANCE_KEY : attendanceKeys.byBranch(user?.branchId ?? ""),
    queryFn: async () => {
      let query = supabase
        .from("attendance_records")
        .select("*")
        .order("date", { ascending: false });

      if (user?.role === "staff" && user?.branchId && branchEmployeeIds.length > 0) {
        query = query.in("employee_id", branchEmployeeIds);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data.map(attendanceRowToApp);
    },
    enabled: !(user?.role === "staff" && !user?.branchId),
  });
}

export function useClockIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (employeeId: string) => {
      const { data, error } = await supabase
        .from("attendance_records")
        .insert({
          employee_id: employeeId,
          date: todayISO(),
          clock_in: nowISO(),
          status: "present",
        })
        .select()
        .single();
      if (error) throw error;
      return attendanceRowToApp(data);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEY }),
  });
}

export function useClockOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (record: AttendanceRecord) => {
      const clockOut = nowISO();
      const hoursWorked = hoursBetween(record.clockIn!, clockOut);
      const shift = detectShift(clockOut);
      const { data, error } = await supabase
        .from("attendance_records")
        .update({
          clock_out: clockOut,
          hours_worked: hoursWorked,
          shift,
        })
        .eq("id", record.id)
        .select()
        .single();
      if (error) throw error;
      return attendanceRowToApp(data);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEY }),
  });
}

export function useManualAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      employeeId,
      date,
      status,
      shift,
    }: {
      employeeId: string;
      date: string;
      status: AttendanceStatus;
      shift?: ShiftType;
    }) => {
      const isPresent = status === "present" && shift;

      const patch: Database["public"]["Tables"]["attendance_records"]["Update"] = { status };

      if (isPresent) {
        const clockInTime = localISO(date, 5, 0);
        const clockOutTime = shift === "full" ? localISO(date, 19, 0) : localISO(date, 12, 0);
        patch.clock_in = clockInTime;
        patch.clock_out = clockOutTime;
        patch.hours_worked = hoursBetween(clockInTime, clockOutTime);
        patch.shift = shift;
      } else {
        patch.clock_in = null;
        patch.clock_out = null;
        patch.hours_worked = null;
        patch.shift = null;
      }

      // Check for existing record
      const { data: existing } = await supabase
        .from("attendance_records")
        .select("id")
        .eq("employee_id", employeeId)
        .eq("date", date)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from("attendance_records")
          .update(patch)
          .eq("id", existing.id)
          .select()
          .single();
        if (error) throw error;
        return attendanceRowToApp(data);
      }

      const { data, error } = await supabase
        .from("attendance_records")
        .insert({
          employee_id: employeeId,
          date,
          clock_in: (patch.clock_in as string) ?? null,
          clock_out: (patch.clock_out as string) ?? null,
          hours_worked: (patch.hours_worked as number) ?? null,
          shift: (patch.shift as ShiftType) ?? null,
          status,
        })
        .select()
        .single();
      if (error) throw error;
      return attendanceRowToApp(data);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEY }),
  });
}

export function useBulkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      employeeIds,
      date,
      status,
      shift,
    }: {
      employeeIds: string[];
      date: string;
      status: AttendanceStatus;
      shift?: ShiftType;
    }) => {
      const isPresent = status === "present" && shift;

      const rows: Database["public"]["Tables"]["attendance_records"]["Insert"][] = employeeIds.map((empId) => {
        if (isPresent) {
          const clockInTime = localISO(date, 5, 0);
          const clockOutTime = shift === "full" ? localISO(date, 19, 0) : localISO(date, 12, 0);
          return {
            employee_id: empId,
            date,
            clock_in: clockInTime,
            clock_out: clockOutTime,
            hours_worked: hoursBetween(clockInTime, clockOutTime),
            shift,
            status,
          };
        }
        return {
          employee_id: empId,
          date,
          clock_in: null,
          clock_out: null,
          hours_worked: null,
          shift: null,
          status,
        };
      });

      const { data, error } = await supabase
        .from("attendance_records")
        .upsert(rows, { onConflict: "employee_id,date" })
        .select();
      if (error) throw error;
      return data.map(attendanceRowToApp);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEY }),
  });
}

export function useReopenDay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ date }: { date: string }) => {
      const { error } = await supabase
        .from("attendance_records")
        .delete()
        .eq("date", date)
        .eq("status", "closed");
      if (error) throw error;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEY }),
  });
}
