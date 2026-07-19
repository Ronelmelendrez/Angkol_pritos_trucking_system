import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceTable } from "@/lib/mockData";
import { hoursBetween, nowISO, todayISO } from "@/utils/date";
import type { AttendanceRecord, AttendanceStatus, ShiftType } from "../types";

const ATTENDANCE_KEY = ["attendance"] as const;

function detectShift(clockOut: string): ShiftType {
  const hour = new Date(clockOut).getHours();
  return hour < 13 || (hour === 13 && new Date(clockOut).getMinutes() < 30) ? "half" : "full";
}

export function useAttendance() {
  return useQuery({
    queryKey: ATTENDANCE_KEY,
    queryFn: () => attendanceTable.list(),
  });
}

export function useClockIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (employeeId: string) =>
      attendanceTable.create({
        employeeId,
        date: todayISO(),
        clockIn: nowISO(),
        clockOut: null,
        hoursWorked: null,
        shift: null,
        status: "present",
      }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEY }),
  });
}

export function useClockOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (record: AttendanceRecord) => {
      const clockOut = nowISO();
      return attendanceTable.update(record.id, {
        clockOut,
        hoursWorked: hoursBetween(record.clockIn!, clockOut),
        shift: detectShift(clockOut),
      });
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
      const existing = attendanceTable
        .list()
        .find((r) => r.employeeId === employeeId && r.date === date);

      const isPresent = status === "present" && shift;

      const patch: Partial<AttendanceRecord> = { status };

      if (isPresent) {
        const clockInTime = `${date}T05:00:00`;
        const clockOutTime = shift === "full" ? `${date}T19:00:00` : `${date}T12:00:00`;
        patch.clockIn = clockInTime;
        patch.clockOut = clockOutTime;
        patch.hoursWorked = hoursBetween(clockInTime, clockOutTime);
        patch.shift = shift;
      } else {
        patch.clockIn = null;
        patch.clockOut = null;
        patch.hoursWorked = null;
        patch.shift = null;
      }

      if (existing) {
        return attendanceTable.update(existing.id, patch);
      }

      return attendanceTable.create({
        employeeId,
        date,
        clockIn: patch.clockIn ?? null,
        clockOut: patch.clockOut ?? null,
        hoursWorked: patch.hoursWorked ?? null,
        shift: patch.shift ?? null,
        status,
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEY }),
  });
}