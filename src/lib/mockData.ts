import type { AttendanceRecord } from "@/features/attendance/types";
import type { CashAdvance } from "@/features/advances/types";
import type { Employee } from "@/features/employees/types";
import type { Expense } from "@/features/expenses/types";
import type { Loan, Repayment } from "@/features/loans/types";
import type { PayrollRun } from "@/features/payroll/types";
import type { Product } from "@/features/products/types";
import type { Sale } from "@/features/sales/types";
import type { StockAdjustment } from "@/features/inventory/types";
import type { BaseRecord } from "@/types";
import type { PayRuleSettings, EmployeePayOverride } from "@/features/settings/types";
import { ADVANCE_STATUSES, EXPENSE_CATEGORIES, LOAN_STATUSES, PAYMENT_METHODS } from "@/lib/constants";

export type NewStockAdjustment = Omit<StockAdjustment, keyof BaseRecord>;

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
    dailyRate: 640,
    hireDate: "2026-01-05",
    isActive: true,
    avatarColor: "#E67E22",
    payFrequency: "semi_monthly",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "emp_2",
    name: "Jun Mercado",
    phone: "09179876543",
    dailyRate: 600,
    hireDate: "2026-02-12",
    isActive: true,
    avatarColor: "#C0392B",
    payFrequency: "semi_monthly",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "emp_3",
    name: "Mila Santos",
    phone: "09991234567",
    dailyRate: 560,
    hireDate: "2025-11-18",
    isActive: false,
    avatarColor: "#F1C40F",
    payFrequency: "semi_monthly",
    createdAt: now,
    updatedAt: now,
  },
];

const attendanceSeed: AttendanceRecord[] = [
  {
    id: "att_1",
    employeeId: "emp_1",
    date: "2026-07-04",
    clockIn: "2026-07-03T21:00:00.000Z",
    clockOut: "2026-07-04T05:00:00.000Z",
    hoursWorked: 8,
    shift: "half",
    status: "present",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "att_2",
    employeeId: "emp_2",
    date: "2026-07-04",
    clockIn: "2026-07-03T21:00:00.000Z",
    clockOut: null,
    hoursWorked: null,
    shift: null,
    status: "present",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "att_3",
    employeeId: "emp_1",
    date: "2026-07-03",
    clockIn: "2026-07-02T21:00:00.000Z",
    clockOut: "2026-07-03T11:00:00.000Z",
    hoursWorked: 14,
    shift: "full",
    status: "present",
    createdAt: now,
    updatedAt: now,
  },
];

const expenseSeed: Expense[] = [
  {
    id: "exp_1",
    date: "2026-07-26",
    category: EXPENSE_CATEGORIES[4],
    description: "Fuel refill",
    amount: 1800,
    supplier: "Petron",
    paymentMethod: PAYMENT_METHODS[0],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "exp_2",
    date: "2026-07-26",
    category: EXPENSE_CATEGORIES[0],
    description: "35kg raw chicken",
    amount: 8050,
    supplier: "Farm Fresh",
    paymentMethod: PAYMENT_METHODS[0],
    productId: "prod_1",
    quantityPurchased: 35,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "exp_3",
    date: "2026-07-25",
    category: EXPENSE_CATEGORIES[5],
    description: "Staff salary — Juan",
    amount: 2500,
    supplier: undefined,
    paymentMethod: PAYMENT_METHODS[0],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "exp_4",
    date: "2026-07-25",
    category: EXPENSE_CATEGORIES[4],
    description: "Diesel for delivery truck",
    amount: 2200,
    supplier: "Shell",
    paymentMethod: PAYMENT_METHODS[2],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "exp_5",
    date: "2026-07-24",
    category: EXPENSE_CATEGORIES[1],
    description: "10 whole lechon manok",
    amount: 7000,
    supplier: "Mang Jose",
    paymentMethod: PAYMENT_METHODS[0],
    productId: "prod_2",
    quantityPurchased: 10,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "exp_6",
    date: "2026-07-24",
    category: EXPENSE_CATEGORIES[6],
    description: "Truck oil change",
    amount: 1200,
    supplier: "Boss Auto Shop",
    paymentMethod: PAYMENT_METHODS[1],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "exp_7",
    date: "2026-07-23",
    category: EXPENSE_CATEGORIES[2],
    description: "20L cooking oil",
    amount: 1600,
    supplier: "Puregold",
    paymentMethod: PAYMENT_METHODS[0],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "exp_8",
    date: "2026-07-22",
    category: EXPENSE_CATEGORIES[3],
    description: "Takeout boxes (200 pcs)",
    amount: 950,
    supplier: "Shopee",
    paymentMethod: PAYMENT_METHODS[1],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "exp_9",
    date: "2026-07-22",
    category: EXPENSE_CATEGORIES[4],
    description: "Fuel — trip to market",
    amount: 600,
    supplier: "Caltex",
    paymentMethod: PAYMENT_METHODS[0],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "exp_10",
    date: "2026-07-21",
    category: EXPENSE_CATEGORIES[1],
    description: "Salt, pepper, magic sarap",
    amount: 320,
    supplier: "Palengke",
    paymentMethod: PAYMENT_METHODS[0],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "exp_11",
    date: "2026-07-20",
    category: EXPENSE_CATEGORIES[1],
    description: "1 gallon vinegar",
    amount: 180,
    supplier: "Sari-sari store",
    paymentMethod: PAYMENT_METHODS[0],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "exp_12",
    date: "2026-07-19",
    category: EXPENSE_CATEGORIES[4],
    description: "1 sack charcoal",
    amount: 350,
    supplier: "Vargas Charcoal",
    paymentMethod: PAYMENT_METHODS[0],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "exp_13",
    date: "2026-07-18",
    category: EXPENSE_CATEGORIES[5],
    description: "Staff salary — Pedro",
    amount: 2500,
    supplier: undefined,
    paymentMethod: PAYMENT_METHODS[0],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "exp_14",
    date: "2026-07-17",
    category: EXPENSE_CATEGORIES[1],
    description: "Soy sauce and garlic",
    amount: 280,
    supplier: "Palengke",
    paymentMethod: PAYMENT_METHODS[0],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "exp_15",
    date: "2026-07-16",
    category: EXPENSE_CATEGORIES[1],
    description: "5kg flour",
    amount: 240,
    supplier: "Baker's Supply",
    paymentMethod: PAYMENT_METHODS[3],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "exp_16",
    date: "2026-07-15",
    category: EXPENSE_CATEGORIES[4],
    description: "Gas tank refill (LPG)",
    amount: 750,
    supplier: "Gasul",
    paymentMethod: PAYMENT_METHODS[0],
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
    remainingBalance: 0,
    dateIssued: "2026-05-14",
    status: LOAN_STATUSES[1],
    notes: undefined,
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

const productSeed: Product[] = [
  {
    id: "prod_1",
    name: "Fried Chicken",
    defaultPrice: 180,
    unit: "order",
    isActive: true,
    estimatedCostPerUnit: 120,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "prod_2",
    name: "Lechon Manok",
    defaultPrice: 450,
    unit: "whole",
    isActive: true,
    estimatedCostPerUnit: 280,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "prod_3",
    name: "Soft Drinks",
    defaultPrice: 25,
    unit: "bottle",
    isActive: true,
    estimatedCostPerUnit: 18,
    createdAt: now,
    updatedAt: now,
  },
];

const saleSeed: Sale[] = [
  {
    id: "sale_1",
    date: "2026-07-26",
    productId: "prod_1",
    quantitySold: 15,
    unitPrice: 180,
    amount: 2700,
    notes: "Lunch rush",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sale_2",
    date: "2026-07-26",
    productId: "prod_2",
    quantitySold: 4,
    unitPrice: 450,
    amount: 1800,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sale_3",
    date: "2026-07-26",
    productId: "prod_3",
    quantitySold: 12,
    unitPrice: 25,
    amount: 300,
    notes: "Walk-in",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sale_4",
    date: "2026-07-25",
    productId: "prod_1",
    quantitySold: 10,
    unitPrice: 180,
    amount: 1800,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sale_5",
    date: "2026-07-25",
    productId: "prod_3",
    quantitySold: 20,
    unitPrice: 25,
    amount: 500,
    notes: "Party order",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sale_6",
    date: "2026-07-24",
    productId: "prod_1",
    quantitySold: 8,
    unitPrice: 180,
    amount: 1440,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sale_7",
    date: "2026-07-24",
    productId: "prod_2",
    quantitySold: 2,
    unitPrice: 450,
    amount: 900,
    notes: "Catering",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sale_8",
    date: "2026-07-23",
    productId: "prod_1",
    quantitySold: 12,
    unitPrice: 180,
    amount: 2160,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sale_9",
    date: "2026-07-23",
    productId: "prod_3",
    quantitySold: 8,
    unitPrice: 25,
    amount: 200,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sale_10",
    date: "2026-07-22",
    productId: "prod_1",
    quantitySold: 6,
    unitPrice: 180,
    amount: 1080,
    notes: "Slow day",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sale_11",
    date: "2026-07-21",
    productId: "prod_2",
    quantitySold: 5,
    unitPrice: 450,
    amount: 2250,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sale_12",
    date: "2026-07-21",
    productId: "prod_1",
    quantitySold: 9,
    unitPrice: 180,
    amount: 1620,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sale_13",
    date: "2026-07-20",
    productId: "prod_3",
    quantitySold: 30,
    unitPrice: 25,
    amount: 750,
    notes: "Weekend volume",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sale_14",
    date: "2026-07-20",
    productId: "prod_1",
    quantitySold: 14,
    unitPrice: 180,
    amount: 2520,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sale_15",
    date: "2026-07-19",
    productId: "prod_1",
    quantitySold: 7,
    unitPrice: 180,
    amount: 1260,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sale_16",
    date: "2026-07-18",
    productId: "prod_2",
    quantitySold: 3,
    unitPrice: 450,
    amount: 1350,
    notes: "Regulars",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sale_17",
    date: "2026-07-18",
    productId: "prod_1",
    quantitySold: 11,
    unitPrice: 180,
    amount: 1980,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sale_18",
    date: "2026-07-17",
    productId: "prod_1",
    quantitySold: 5,
    unitPrice: 180,
    amount: 900,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sale_19",
    date: "2026-07-17",
    productId: "prod_3",
    quantitySold: 15,
    unitPrice: 25,
    amount: 375,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sale_20",
    date: "2026-07-16",
    productId: "prod_1",
    quantitySold: 10,
    unitPrice: 180,
    amount: 1800,
    notes: "Tuesday lunch",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sale_21",
    date: "2026-07-15",
    productId: "prod_2",
    quantitySold: 6,
    unitPrice: 450,
    amount: 2700,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sale_22",
    date: "2026-07-15",
    productId: "prod_1",
    quantitySold: 8,
    unitPrice: 180,
    amount: 1440,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sale_23",
    date: "2026-07-14",
    productId: "prod_3",
    quantitySold: 25,
    unitPrice: 25,
    amount: 625,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sale_24",
    date: "2026-07-13",
    productId: "prod_1",
    quantitySold: 13,
    unitPrice: 180,
    amount: 2340,
    notes: "Sunday crowd",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sale_25",
    date: "2026-07-12",
    productId: "prod_1",
    quantitySold: 9,
    unitPrice: 180,
    amount: 1620,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sale_26",
    date: "2026-07-12",
    productId: "prod_2",
    quantitySold: 2,
    unitPrice: 450,
    amount: 900,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sale_27",
    date: "2026-07-11",
    productId: "prod_1",
    quantitySold: 7,
    unitPrice: 180,
    amount: 1260,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sale_28",
    date: "2026-07-10",
    productId: "prod_3",
    quantitySold: 18,
    unitPrice: 25,
    amount: 450,
    notes: "Bulk purchase",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sale_29",
    date: "2026-07-10",
    productId: "prod_1",
    quantitySold: 11,
    unitPrice: 180,
    amount: 1980,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sale_30",
    date: "2026-07-09",
    productId: "prod_2",
    quantitySold: 4,
    unitPrice: 450,
    amount: 1800,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sale_31",
    date: "2026-07-08",
    productId: "prod_1",
    quantitySold: 6,
    unitPrice: 180,
    amount: 1080,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sale_32",
    date: "2026-07-07",
    productId: "prod_1",
    quantitySold: 10,
    unitPrice: 180,
    amount: 1800,
    notes: "Monday start",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sale_33",
    date: "2026-07-07",
    productId: "prod_3",
    quantitySold: 14,
    unitPrice: 25,
    amount: 350,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sale_34",
    date: "2026-07-06",
    productId: "prod_1",
    quantitySold: 8,
    unitPrice: 180,
    amount: 1440,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sale_35",
    date: "2026-07-05",
    productId: "prod_2",
    quantitySold: 3,
    unitPrice: 450,
    amount: 1350,
    notes: "Holiday weekend",
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
export const productsTable = createTable(productSeed);
export const salesTable = createTable(saleSeed);

const adjustmentSeed: StockAdjustment[] = [];
export const adjustmentsTable = createTable(adjustmentSeed);

const payrollRunSeed: PayrollRun[] = [];
export const payrollRunsTable = createTable(payrollRunSeed);

const payRuleSettingsSeed: PayRuleSettings[] = [
  {
    id: "global",
    defaultReorderThreshold: 5,
    spoilageRateThreshold: 5,
    standardHoursPerDay: 8,
    halfDayThresholdHours: 4,
    halfDayRateMultiplier: 0.5,
    lateGraceMinutes: 10,
    lateDeductionPerMinute: 0,
    absenceDeductionMode: "full_day",
    restDayRateMultiplier: 1.3,
    holidayRateMultiplier: 2.0,
    nightDifferentialPercent: 10,
    roundHoursTo: 0.25,
    paydayRules: [
      { frequency: "weekly", offsetDays: 0, weekendAdjustment: "none", fixedWeekday: 5 },
      { frequency: "semi_monthly", offsetDays: 0, weekendAdjustment: "none" },
      { frequency: "monthly", offsetDays: 0, weekendAdjustment: "none" },
    ],
    createdAt: now,
    updatedAt: now,
  },
];
export const payRuleSettingsTable = createTable(payRuleSettingsSeed);

const employeePayOverrideSeed: EmployeePayOverride[] = [];
export const employeePayOverridesTable = createTable(employeePayOverrideSeed);