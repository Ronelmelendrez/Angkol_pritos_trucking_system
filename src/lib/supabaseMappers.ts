import type { Database } from "@/types/database.types";
import type { ExpenseCategory, PaymentMethod, ExpenseFundSource } from "@/lib/constants";
import type { PaydayRule } from "@/features/settings/types";
import type { AdjustmentReason } from "@/features/inventory/types";
import type { PaymentType } from "@/features/orders/types";

type ExpenseRow = Database["public"]["Tables"]["expenses"]["Row"];
type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type StockAdjRow = Database["public"]["Tables"]["stock_adjustments"]["Row"];
type PayrollRunRow = Database["public"]["Tables"]["payroll_runs"]["Row"];
type EmployeeRow = Database["public"]["Tables"]["employees"]["Row"];
type AttendanceRow = Database["public"]["Tables"]["attendance_records"]["Row"];
type AdvanceRow = Database["public"]["Tables"]["cash_advances"]["Row"];
type LoanRow = Database["public"]["Tables"]["loans"]["Row"];
type RepaymentRow = Database["public"]["Tables"]["repayments"]["Row"];
type SaleRow = Database["public"]["Tables"]["sales"]["Row"];
type PayRuleRow = Database["public"]["Tables"]["pay_rule_settings"]["Row"];
type OverrideRow = Database["public"]["Tables"]["employee_pay_overrides"]["Row"];
type CashOpeningRow = Database["public"]["Tables"]["cash_openings"]["Row"];
type CashCountRow = Database["public"]["Tables"]["cash_counts"]["Row"];
type OwnerWithdrawalRow = Database["public"]["Tables"]["owner_withdrawals"]["Row"];

// ── Payment method normalization ──────────────────────
const PM_APP_TO_DB: Record<string, string> = {
  Cash: "cash",
  GCash: "gcash",
  "Bank Transfer": "bank_transfer",
  Credit: "credit",
};
const PM_DB_TO_APP: Record<string, string> = Object.fromEntries(
  Object.entries(PM_APP_TO_DB).map(([k, v]) => [v, k]),
);

// ── Expenses ──────────────────────────────────────────
export function expenseRowToApp(row: ExpenseRow & { categories?: { name: string } | null }) {
  return {
    id: row.id,
    date: row.date,
    category: (row.categories?.name ?? "") as ExpenseCategory,
    description: row.description ?? "",
    amount: Number(row.amount),
    supplier: row.supplier ?? undefined,
    paymentMethod: (PM_DB_TO_APP[row.payment_method] ?? "Cash") as PaymentMethod,
    fundSource: row.fund_source ?? undefined,
    productId: row.product_id ?? undefined,
    quantityPurchased: row.quantity_purchased ?? undefined,
    createdBy: row.created_by ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function expenseAppToRow(input: {
  date: string;
  category_id: string;
  description?: string;
  amount: number;
  supplier?: string;
  paymentMethod: string;
  fundSource?: ExpenseFundSource | null;
  product_id?: string | null;
  quantity_purchased?: number | null;
  created_by?: string | null;
}) {
  return {
    date: input.date,
    category_id: input.category_id,
    description: input.description || null,
    amount: input.amount,
    supplier: input.supplier || null,
    payment_method: (PM_APP_TO_DB[input.paymentMethod] ?? "cash") as ExpenseRow["payment_method"],
    fund_source: input.fundSource ?? null,
    product_id: input.product_id || null,
    quantity_purchased: input.quantity_purchased ?? null,
    created_by: input.created_by ?? null,
  };
}

// ── Products ──────────────────────────────────────────
export function productRowToApp(row: ProductRow) {
  return {
    id: row.id,
    name: row.name,
    defaultPrice: Number(row.default_price),
    unit: row.unit,
    isActive: row.is_active,
    reorderThreshold: row.reorder_threshold ?? undefined,
    estimatedCostPerUnit: row.estimated_cost_per_unit != null ? Number(row.estimated_cost_per_unit) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function productAppToRow(input: {
  name: string;
  defaultPrice: number;
  unit: string;
  isActive: boolean;
  reorderThreshold?: number;
  estimatedCostPerUnit?: number;
}) {
  return {
    name: input.name,
    default_price: input.defaultPrice,
    unit: input.unit,
    is_active: input.isActive,
    reorder_threshold: input.reorderThreshold ?? null,
    estimated_cost_per_unit: input.estimatedCostPerUnit ?? null,
  };
}

// ── Stock Adjustments ─────────────────────────────────
export function stockAdjRowToApp(row: StockAdjRow) {
  return {
    id: row.id,
    productId: row.product_id,
    date: row.date,
    quantity: row.quantity,
    note: row.note,
    reason: (row.reason ?? "other") as AdjustmentReason,
    source: (row.source ?? "adjustment") as "purchase" | "adjustment",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function stockAdjAppToRow(input: {
  productId: string;
  date: string;
  quantity: number;
  note?: string;
  reason?: AdjustmentReason;
  source?: "purchase" | "adjustment";
}) {
  return {
    product_id: input.productId,
    date: input.date,
    quantity: input.quantity,
    note: input.note ?? "",
    reason: input.reason ?? "other",
    source: input.source ?? "adjustment",
  };
}

// ── Payroll Runs ──────────────────────────────────────
export function payrollRunRowToApp(
  row: PayrollRunRow & { employees?: { name: string } | null },
) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    hoursWorked: Number(row.hours_worked),
    dailyRate: Number(row.daily_rate),
    grossPay: Number(row.gross_pay),
    advanceDeductions: Number(row.advance_deductions),
    loanDeductions: Number(row.loan_deductions),
    adjustments: Number(row.adjustments),
    adjustmentNote: row.adjustment_note ?? undefined,
    netPay: Number(row.net_pay),
    status: row.status,
    paidAt: row.paid_at ?? undefined,
    advanceIds: (row.advance_ids as string[]) ?? [],
    loanId: row.loan_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    employeeName: row.employees?.name ?? "Unknown",
  };
}

// ── Employees ─────────────────────────────────────────
export function employeeRowToApp(row: EmployeeRow) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone ?? "",
    dailyRate: Number(row.daily_rate),
    hireDate: row.hire_date,
    isActive: row.is_active,
    avatarColor: row.avatar_color ?? "#888888",
    payFrequency: row.pay_frequency,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function employeeAppToRow(input: {
  name: string;
  phone: string;
  dailyRate: number;
  hireDate: string;
  isActive: boolean;
  avatarColor?: string;
  payFrequency: string;
}) {
  return {
    name: input.name,
    phone: input.phone || null,
    daily_rate: input.dailyRate,
    hire_date: input.hireDate,
    is_active: input.isActive,
    avatar_color: input.avatarColor ?? null,
    pay_frequency: input.payFrequency as EmployeeRow["pay_frequency"],
  };
}

// ── Attendance Records ────────────────────────────────
export function attendanceRowToApp(row: AttendanceRow) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    date: row.date,
    clockIn: row.clock_in ?? null,
    clockOut: row.clock_out ?? null,
    hoursWorked: row.hours_worked != null ? Number(row.hours_worked) : null,
    shift: row.shift ?? null,
    status: row.status ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── Cash Advances ─────────────────────────────────────
export function advanceRowToApp(row: AdvanceRow) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    amount: Number(row.amount),
    date: row.date,
    status: row.status,
    reason: row.reason ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── Loans ─────────────────────────────────────────────
export function loanRowToApp(row: LoanRow) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    principal: Number(row.principal),
    remainingBalance: Number(row.remaining_balance),
    dateIssued: row.date_issued,
    status: row.status,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── Repayments ────────────────────────────────────────
export function repaymentRowToApp(row: RepaymentRow) {
  return {
    id: row.id,
    loanId: row.loan_id,
    amount: Number(row.amount),
    date: row.date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── Sales ─────────────────────────────────────────────
export function saleRowToApp(row: SaleRow) {
  return {
    id: row.id,
    date: row.date,
    productId: row.product_id,
    quantitySold: row.quantity_sold,
    unitPrice: Number(row.unit_price),
    amount: Number(row.amount),
    notes: row.notes ?? undefined,
    orderId: row.order_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function saleAppToRow(input: {
  date: string;
  product_id: string;
  quantity_sold: number;
  unit_price: number;
  amount: number;
  notes?: string;
  order_id?: string | null;
}) {
  return {
    date: input.date,
    product_id: input.product_id,
    quantity_sold: input.quantity_sold,
    unit_price: input.unit_price,
    amount: input.amount,
    notes: input.notes ?? null,
    order_id: input.order_id ?? null,
  };
}

// ── Orders ────────────────────────────────────────────
type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];

export function orderItemRowToApp(row: OrderItemRow) {
  return {
    id: row.id,
    orderId: row.order_id,
    productId: row.product_id,
    quantity: row.quantity,
    unitPrice: Number(row.unit_price),
    amount: Number(row.amount),
  };
}

export function orderItemAppToRow(input: {
  productId?: string;
  product_id?: string;
  quantity: number;
  unitPrice?: number;
  unit_price?: number;
  amount: number;
}) {
  return {
    product_id: input.productId ?? input.product_id ?? "",
    quantity: input.quantity,
    unit_price: input.unitPrice ?? input.unit_price ?? 0,
    amount: input.amount,
  };
}

export function orderRowToApp(row: OrderRow, items: OrderItemRow[] = []) {
  return {
    id: row.id,
    orderNumber: (row as Record<string, unknown>).order_number as string ?? "SO-000000",
    date: row.date,
    scheduledTime: row.scheduled_time ?? undefined,
    customerName: row.customer_name,
    contactNumber: (row as Record<string, unknown>).contact_number as string ?? "",
    status: row.status as "scheduled" | "completed" | "cancelled",
    total: Number(row.total),
    depositAmount: (row as Record<string, unknown>).deposit_amount != null ? Number((row as Record<string, unknown>).deposit_amount) : 0,
    balanceAmount: (row as Record<string, unknown>).balance_amount != null ? Number((row as Record<string, unknown>).balance_amount) : Number(row.total),
    cancelReason: (row as Record<string, unknown>).cancel_reason as string ?? undefined,
    notes: row.notes ?? undefined,
    createdBy: row.created_by ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: items.map(orderItemRowToApp),
  };
}

export function orderAppToRow(input: {
  date: string;
  customer_name: string;
  contact_number?: string;
  order_number?: string;
  scheduled_time?: string | null;
  status?: "scheduled" | "completed" | "cancelled";
  total?: number;
  deposit_amount?: number;
  balance_amount?: number;
  cancel_reason?: string;
  notes?: string;
  created_by?: string;
}) {
  return {
    date: input.date,
    customer_name: input.customer_name,
    contact_number: input.contact_number ?? "",
    order_number: input.order_number ?? null,
    scheduled_time: input.scheduled_time ?? null,
    status: (input.status ?? "scheduled") as "scheduled" | "completed" | "cancelled",
    total: input.total ?? 0,
    deposit_amount: input.deposit_amount ?? 0,
    balance_amount: input.balance_amount ?? 0,
    cancel_reason: input.cancel_reason ?? null,
    notes: input.notes ?? null,
    created_by: input.created_by ?? null,
  };
}

// ── Scheduled Order Payments ──────────────────────────
type OrderPaymentRow = Database["public"]["Tables"]["scheduled_order_payments"]["Row"];

export function orderPaymentRowToApp(row: OrderPaymentRow) {
  return {
    id: row.id,
    orderId: row.order_id,
    paymentType: row.payment_type as "deposit" | "final" | "extra",
    amount: Number(row.amount),
    paymentDate: row.payment_date,
    notes: row.notes ?? undefined,
    createdBy: row.created_by ?? undefined,
    createdAt: row.created_at,
  };
}

export function orderPaymentAppToRow(input: {
  order_id: string;
  payment_type: PaymentType;
  amount: number;
  payment_date: string;
  notes?: string;
  created_by?: string;
}) {
  return {
    order_id: input.order_id,
    payment_type: input.payment_type,
    amount: input.amount,
    payment_date: input.payment_date,
    notes: input.notes ?? null,
    created_by: input.created_by ?? null,
  };
}

// ── Pay Rule Settings ─────────────────────────────────
export function payRuleRowToApp(row: PayRuleRow) {
  return {
    id: row.id,
    defaultReorderThreshold: row.default_reorder_threshold,
    defaultOpeningCash: Number(row.default_opening_cash),
    spoilageRateThreshold: Number(row.spoilage_rate_threshold ?? 5),
    standardHoursPerDay: Number(row.standard_hours_per_day),
    halfDayThresholdHours: Number(row.half_day_threshold_hours),
    halfDayRateMultiplier: Number(row.half_day_rate_multiplier),
    lateGraceMinutes: row.late_grace_minutes,
    lateDeductionPerMinute: Number(row.late_deduction_per_minute),
    absenceDeductionMode: row.absence_deduction_mode,
    restDayRateMultiplier: Number(row.rest_day_rate_multiplier),
    holidayRateMultiplier: Number(row.holiday_rate_multiplier),
    nightDifferentialPercent: Number(row.night_differential_percent),
    roundHoursTo: Number(row.round_hours_to) as 0 | 0.25 | 0.5,
    paydayRules: (row.payday_rules as unknown as PaydayRule[] | null) ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── Employee Pay Overrides ────────────────────────────
export function overrideRowToApp(row: OverrideRow) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    halfDayRateMultiplier: row.half_day_rate_multiplier ?? undefined,
    lateDeductionPerMinute: row.late_deduction_per_minute ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── Cash Openings ─────────────────────────────────────────────
export function cashOpeningRowToApp(row: CashOpeningRow) {
  return {
    id: row.id,
    date: row.date,
    openingCash: Number(row.opening_cash),
    createdBy: row.created_by ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function cashOpeningAppToRow(input: {
  date: string;
  openingCash: number;
  createdBy?: string;
}) {
  return {
    date: input.date,
    opening_cash: input.openingCash,
    created_by: input.createdBy ?? null,
  };
}

// ── Cash Counts ───────────────────────────────────────────────
export function cashCountRowToApp(row: CashCountRow) {
  return {
    id: row.id,
    date: row.date,
    expectedCash: Number(row.expected_cash),
    actualCash: Number(row.actual_cash),
    difference: Number(row.difference),
    remarks: row.remarks ?? undefined,
    countedBy: row.counted_by ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function cashCountAppToRow(input: {
  date: string;
  expectedCash: number;
  actualCash: number;
  difference: number;
  remarks?: string;
  countedBy?: string;
}) {
  return {
    date: input.date,
    expected_cash: input.expectedCash,
    actual_cash: input.actualCash,
    difference: input.difference,
    remarks: input.remarks ?? null,
    counted_by: input.countedBy ?? null,
  };
}

// ── Owner Withdrawals ─────────────────────────────────────────
export function ownerWithdrawalRowToApp(row: OwnerWithdrawalRow) {
  return {
    id: row.id,
    date: row.date,
    amount: Number(row.amount),
    reason: row.reason ?? undefined,
    createdBy: row.created_by ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function ownerWithdrawalAppToRow(input: {
  date: string;
  amount: number;
  reason?: string;
  createdBy?: string;
}) {
  return {
    date: input.date,
    amount: input.amount,
    reason: input.reason ?? null,
    created_by: input.createdBy ?? null,
  };
}
