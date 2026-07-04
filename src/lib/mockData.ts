import type { AttendanceRecord } from "@/features/attendance/types";
import type { CashAdvance } from "@/features/advances/types";
import type { Employee } from "@/features/employees/types";
import type { Expense } from "@/features/expenses/types";
import type { Loan, Repayment } from "@/features/loans/types";
import type { BaseRecord } from "@/types";
import { ADVANCE_STATUSES, EXPENSE_CATEGORIES, LOAN_STATUSES, PAYMENT_METHODS } from "@/lib/constants";

type RecordTable<T extends BaseRecord> = {
  list: () => T[];
  create: (input: Omit<T, keyof BaseRecord>) => Promise<T>;
  update: (id: string, patch: Partial<Omit<T, keyof BaseRecord>>) => Promise<T>;
  remove: (id: string) => Promise<void>;
};

function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function createTable<T extends BaseRecord>(seed: T[]): RecordTable<T> {
  let rows = [...seed];

  return {
    list: () => [...rows],
    create: async (input) => {
      const now = new Date().toISOString();
      const row = {
        ...input,
        id: createId("row"),
        createdAt: now,
        updatedAt: now,
      } as T;
      rows = [row, ...rows];
      return row;
    },
    update: async (id, patch) => {
      const now = new Date().toISOString();
      const next = rows.map((row) => (row.id === id ? ({ ...row, ...patch, updatedAt: now } as T) : row));
      const updated = next.find((row) => row.id === id);
      if (!updated) {
        throw new Error(`Record not found: ${id}`);
      }
      rows = next;
      return updated;
    },
    remove: async (id) => {
      rows = rows.filter((row) => row.id !== id);
    },
  };
}

const now = new Date().toISOString();

const employeeSeed: Employee[] = [
  {
    id: "emp_1",
    name: "Rosa Dimaculangan",
    phone: "09171234567",
    hourlyRate: 80,
    hireDate: "2026-01-05",
    isActive: true,
    avatarColor: "#E67E22",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "emp_2",
    name: "Jun Mercado",
    phone: "09179876543",
    hourlyRate: 75,
    hireDate: "2026-02-12",
    isActive: true,
    avatarColor: "#C0392B",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "emp_3",
    name: "Mila Santos",
    phone: "09991234567",
    hourlyRate: 70,
    hireDate: "2025-11-18",
    isActive: false,
    avatarColor: "#F1C40F",
    createdAt: now,
    updatedAt: now,
  },
];

const attendanceSeed: AttendanceRecord[] = [
  {
    id: "att_1",
    employeeId: "emp_1",
    date: "2026-07-04",
    clockIn: "2026-07-04T06:00:00.000Z",
    clockOut: "2026-07-04T14:00:00.000Z",
    hoursWorked: 8,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "att_2",
    employeeId: "emp_2",
    date: "2026-07-04",
    clockIn: "2026-07-04T07:00:00.000Z",
    clockOut: null,
    hoursWorked: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "att_3",
    employeeId: "emp_1",
    date: "2026-07-03",
    clockIn: "2026-07-03T06:00:00.000Z",
    clockOut: "2026-07-03T14:30:00.000Z",
    hoursWorked: 8.5,
    createdAt: now,
    updatedAt: now,
  },
];

const expenseSeed: Expense[] = [
  {
    id: "exp_1",
    date: "2026-07-04",
    category: EXPENSE_CATEGORIES[5],
    description: "Fuel refill",
    amount: 1800,
    supplier: "Petron",
    paymentMethod: PAYMENT_METHODS[0],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "exp_2",
    date: "2026-07-03",
    category: EXPENSE_CATEGORIES[0],
    description: "Raw chicken supply",
    amount: 9200,
    supplier: "Farm Fresh",
    paymentMethod: PAYMENT_METHODS[0],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "exp_3",
    date: "2026-07-02",
    category: EXPENSE_CATEGORIES[7],
    description: "Cleaning supplies",
    amount: 540,
    supplier: null,
    paymentMethod: PAYMENT_METHODS[1],
    createdAt: now,
    updatedAt: now,
  },
];

const advanceSeed: CashAdvance[] = [
  {
    id: "adv_1",
    employeeId: "emp_1",
    amount: 500,
    date: "2026-07-02",
    status: ADVANCE_STATUSES[0],
    reason: "Fare",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "adv_2",
    employeeId: "emp_2",
    amount: 300,
    date: "2026-07-01",
    status: ADVANCE_STATUSES[1],
    reason: "Emergency",
    createdAt: now,
    updatedAt: now,
  },
];

const loanSeed: Loan[] = [
  {
    id: "loan_1",
    employeeId: "emp_1",
    principal: 5000,
    interestRate: 0,
    remainingBalance: 2800,
    dateIssued: "2026-06-20",
    status: LOAN_STATUSES[0],
    notes: "Truck repair assistance",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "loan_2",
    employeeId: "emp_3",
    principal: 2500,
    interestRate: 0,
    remainingBalance: 0,
    dateIssued: "2026-05-14",
    status: LOAN_STATUSES[1],
    notes: null,
    createdAt: now,
    updatedAt: now,
  },
];

const repaymentSeed: Repayment[] = [
  {
    id: "rep_1",
    loanId: "loan_1",
    amount: 1200,
    date: "2026-07-01",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "rep_2",
    loanId: "loan_1",
    amount: 1000,
    date: "2026-07-03",
    createdAt: now,
    updatedAt: now,
  },
];

export const employeesTable = createTable(employeeSeed);
export const attendanceTable = createTable(attendanceSeed);
export const expensesTable = createTable(expenseSeed);
export const advancesTable = createTable(advanceSeed);
export const loansTable = createTable(loanSeed);
export const repaymentsTable = createTable(repaymentSeed);