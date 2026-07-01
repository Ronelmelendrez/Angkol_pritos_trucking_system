import type { BaseRecord } from "@/types";

export interface Employee extends BaseRecord {
  name: string;
  phone: string;
  hourlyRate: number;
  hireDate: string; // YYYY-MM-DD
  isActive: boolean;
  avatarColor: string; // deterministic accent color for avatar chip
}

export type NewEmployee = Omit<Employee, "id" | "createdAt" | "updatedAt" | "avatarColor">;
export type UpdateEmployee = Partial<NewEmployee> & { id: string };