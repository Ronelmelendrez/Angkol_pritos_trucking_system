import type { BaseRecord } from "@/types";

export interface AttendanceRecord extends BaseRecord {
  employeeId: string;
  date: string; // YYYY-MM-DD
  clockIn: string; // ISO timestamp
  clockOut: string | null; // ISO timestamp, null while clocked in
  hoursWorked: number | null;
}

export type NewAttendanceRecord = Omit<
  AttendanceRecord,
  "id" | "createdAt" | "updatedAt" | "hoursWorked"
>;