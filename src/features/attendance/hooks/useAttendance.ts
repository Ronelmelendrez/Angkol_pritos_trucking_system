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
    }: {
      employeeId: string;
      date: string;
      status: AttendanceStatus;
    }) => {
      const existing = attendanceTable
        .list()
        .find((r) => r.employeeId === employeeId && r.date === date);

      if (existing) {
        return attendanceTable.update(existing.id, { status });
      }

      return attendanceTable.create({
        employeeId,
        date,
        clockIn: null,
        clockOut: null,
        hoursWorked: null,
        shift: null,
        status,
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEY }),
  });
}