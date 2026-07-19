import type { BaseRecord } from "@/types";

export type ShiftType = "full" | "half";
export type AttendanceStatus = "present" | "absent";

export interface AttendanceRecord extends BaseRecord {
  employeeId: string;
  date: string; // YYYY-MM-DD
  clockIn: string | null; // ISO timestamp, null for manual entries
  clockOut: string | null; // ISO timestamp, null while clocked in
  hoursWorked: number | null;
  shift: ShiftType | null; // null while clocked in, set on clock-out
  status: AttendanceStatus | null; // present/absent for manual, null for clock-based
}

export type NewAttendanceRecord = Omit<
  AttendanceRecord,
  "id" | "createdAt" | "updatedAt" | "hoursWorked"
>;