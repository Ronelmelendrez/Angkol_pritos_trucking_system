import type { BaseRecord } from "@/types";

export type PayFrequency = "weekly" | "semi_monthly" | "monthly";

export interface Employee extends BaseRecord {
  name: string;
  phone: string;
  hourlyRate: number;
  hireDate: string;
  isActive: boolean;
  avatarColor: string;
  payFrequency: PayFrequency;
}

export type NewEmployee = Omit<Employee, "id" | "createdAt" | "updatedAt" | "avatarColor">;
export type UpdateEmployee = Partial<NewEmployee> & { id: string };