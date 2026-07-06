import { z } from "zod";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/lib/constants";

export const expenseSchema = z.object({
  date: z.string().min(1, "Date is required"),
  category: z.enum(EXPENSE_CATEGORIES, {
    error: "Choose a category",
  }),
  description: z.string().min(2, "Add a short description"),
  amount: z.coerce.number().positive("Amount must be greater than ₱0"),
  supplier: z.string().optional(),
  paymentMethod: z.enum(PAYMENT_METHODS, {
    error: "Choose a payment method",
  }),
});
export type ExpenseFormValues = z.infer<typeof expenseSchema>;

export const employeeSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z
    .string()
    .min(7, "Enter a valid phone number")
    .regex(/^[0-9+\-\s]+$/, "Digits only please"),
  hourlyRate: z.coerce.number().positive("Rate must be greater than ₱0"),
  hireDate: z.string().min(1, "Hire date is required"),
  isActive: z.boolean(),
});
export type EmployeeFormValues = z.infer<typeof employeeSchema>;

export const advanceSchema = z.object({
  employeeId: z.string().min(1, "Choose an employee"),
  amount: z.coerce.number().positive("Amount must be greater than ₱0"),
  date: z.string().min(1, "Date is required"),
  reason: z.string().optional(),
});
export type AdvanceFormValues = z.infer<typeof advanceSchema>;

export const loanSchema = z.object({
  employeeId: z.string().min(1, "Choose an employee"),
  principal: z.coerce.number().positive("Amount must be greater than ₱0"),
  interestRate: z.coerce.number().min(0, "Cannot be negative"),
  dateIssued: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
});
export type LoanFormValues = z.infer<typeof loanSchema>;

export const repaymentSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than ₱0"),
  date: z.string().min(1, "Date is required"),
});
export type RepaymentFormValues = z.infer<typeof repaymentSchema>;

export const saleSchema = z.object({
  date: z.string().min(1, "Date is required"),
  expenseId: z.string().optional(),
  description: z.string().min(2, "Add a short description"),
  quantitySold: z.coerce.number().positive("Qty must be positive").optional(),
  amount: z.coerce.number().positive("Amount must be greater than ₱0"),
});
export type SaleFormValues = z.infer<typeof saleSchema>;