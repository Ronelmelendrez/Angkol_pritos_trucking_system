import { z } from "zod";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS, STOCK_CATEGORIES } from "@/lib/constants";

export const expenseItemSchema = z.object({
  productId: z.string().min(1, "Choose a product"),
  quantityPurchased: z.coerce.number().min(0.01, "Qty must be at least 0.01"),
});

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
  productId: z.string().optional().or(z.literal("")),
  quantityPurchased: z.coerce.number().positive("Qty must be greater than 0").optional(),
  items: z.array(expenseItemSchema).optional(),
}).refine(
  (data) => {
    if (STOCK_CATEGORIES.includes(data.category as any)) {
      const validItems = (data.items ?? []).filter(
        (i) => i.productId && i.productId !== "" && i.quantityPurchased > 0
      );
      return validItems.length > 0;
    }
    return true;
  },
  { message: "Stock expenses require at least one product with quantity", path: ["items"] }
);
export type ExpenseFormValues = z.infer<typeof expenseSchema>;

export const employeeSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z
    .string()
    .min(7, "Enter a valid phone number")
    .regex(/^[0-9+\-\s]+$/, "Digits only please"),
  dailyRate: z.coerce.number().positive("Rate must be greater than ₱0"),
  hireDate: z.string().min(1, "Hire date is required"),
  isActive: z.boolean(),
  payFrequency: z.enum(["weekly", "semi_monthly", "monthly"]),
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
  dateIssued: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
});
export type LoanFormValues = z.infer<typeof loanSchema>;

export const repaymentSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than ₱0"),
  date: z.string().min(1, "Date is required"),
});
export type RepaymentFormValues = z.infer<typeof repaymentSchema>;

export const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  defaultPrice: z.coerce.number().positive("Price must be greater than ₱0"),
  unit: z.string().min(1, "Unit is required"),
  reorderThreshold: z.coerce.number().min(0, "Must be 0 or more").optional(),
});
export type ProductFormValues = z.infer<typeof productSchema>;

export const saleSchema = z.object({
  date: z.string().min(1, "Date is required"),
  productId: z.string().min(1, "Choose a product"),
  quantitySold: z.number().positive("Qty must be greater than 0"),
  unitPrice: z.number().positive("Price must be greater than ₱0"),
  amount: z.number().positive("Amount must be greater than ₱0"),
  notes: z.string().optional(),
});
export type SaleFormValues = z.infer<typeof saleSchema>;