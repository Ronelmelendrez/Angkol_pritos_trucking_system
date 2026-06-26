import { z } from "zod"
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/lib/constants"

/**
 * Each schema below uses z.coerce.number() because native <input type="number">
 * elements give react-hook-form string values. That makes the schema's INPUT
 * type (what useForm<T> should be parameterized with) different from its
 * OUTPUT type (what you get back in onSubmit, after coercion). We export both:
 *   - `XFormSchema`      -> input type, used for useForm<XFormSchema>
 *   - `XFormSchemaOutput`-> output type, used for the onSubmit(values) handler
 */

export const expenseSchema = z.object({
  expense_date: z.string().min(1, "Date is required"),
  category: z.enum(EXPENSE_CATEGORIES, {
    message: "Select a category",
  }),
  description: z.string().max(200, "Keep it under 200 characters").optional(),
  amount: z.coerce
    .number({ message: "Enter a valid amount" })
    .positive("Amount must be greater than ₱0"),
  supplier: z.string().max(120, "Keep it under 120 characters").optional(),
  payment_method: z.enum(PAYMENT_METHODS, {
    message: "Select a payment method",
  }),
})

export type ExpenseFormSchema = z.input<typeof expenseSchema>
export type ExpenseFormSchemaOutput = z.output<typeof expenseSchema>

export const employeeSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  phone: z
    .string()
    .max(30)
    .optional()
    .refine((v) => !v || /^[\d+\-\s()]{6,}$/.test(v), "Enter a valid phone number"),
  hourly_rate: z.coerce
    .number({ message: "Enter a valid rate" })
    .nonnegative("Rate can't be negative"),
  hire_date: z.string().min(1, "Hire date is required"),
  is_active: z.boolean(),
})

export type EmployeeFormSchema = z.input<typeof employeeSchema>
export type EmployeeFormSchemaOutput = z.output<typeof employeeSchema>

export const advanceSchema = z.object({
  employee_id: z.string().min(1, "Select an employee"),
  amount: z.coerce.number({ message: "Enter a valid amount" }).positive("Must be greater than ₱0"),
  advance_date: z.string().min(1, "Date is required"),
  notes: z.string().max(200).optional(),
})

export type AdvanceFormSchema = z.input<typeof advanceSchema>
export type AdvanceFormSchemaOutput = z.output<typeof advanceSchema>

export const loanSchema = z.object({
  employee_id: z.string().min(1, "Select an employee"),
  principal_amount: z.coerce
    .number({ message: "Enter a valid amount" })
    .positive("Must be greater than ₱0"),
  interest_rate: z.coerce.number().min(0, "Can't be negative").max(100, "Seems too high"),
  loan_date: z.string().min(1, "Date is required"),
  notes: z.string().max(200).optional(),
})

export type LoanFormSchema = z.input<typeof loanSchema>
export type LoanFormSchemaOutput = z.output<typeof loanSchema>

export const repaymentSchema = z.object({
  amount: z.coerce.number({ message: "Enter a valid amount" }).positive("Must be greater than ₱0"),
  repayment_date: z.string().min(1, "Date is required"),
  notes: z.string().max(200).optional(),
})

export type RepaymentFormSchema = z.input<typeof repaymentSchema>
export type RepaymentFormSchemaOutput = z.output<typeof repaymentSchema>

export const dailySummarySchema = z.object({
  summary_date: z.string().min(1, "Date is required"),
  total_sales: z.coerce.number({ message: "Enter a valid amount" }).nonnegative(),
  notes: z.string().max(200).optional(),
})

export type DailySummaryFormSchema = z.input<typeof dailySummarySchema>
export type DailySummaryFormSchemaOutput = z.output<typeof dailySummarySchema>