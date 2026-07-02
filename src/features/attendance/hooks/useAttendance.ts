import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceTable } from "@/lib/mockData";
import { hoursBetween, nowISO, todayISO } from "@/utils/date";
import type { AttendanceRecord } from "../types";

const ATTENDANCE_KEY = ["attendance"] as const;

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
        hoursWorked: hoursBetween(record.clockIn, clockOut),
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEY }),
  });
}