import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { expenseSchema, type ExpenseFormSchema, type ExpenseFormSchemaOutput } from "@/utils/validators"
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/lib/constants"
import { todayISO } from "@/utils/date"
import { useAddExpense } from "@/features/expenses/hooks/useAddExpense"
import { useUpdateExpense } from "@/features/expenses/hooks/useUpdateExpense"
import type { Expense } from "@/types"

interface ExpenseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Pass an existing expense to edit; omit to create a new one */
  expense?: Expense
}

const emptyDefaults: ExpenseFormSchema = {
  expense_date: todayISO(),
  category: EXPENSE_CATEGORIES[0],
  description: "",
  amount: 0,
  supplier: "",
  payment_method: PAYMENT_METHODS[0],
}

export function ExpenseForm({ open, onOpenChange, expense }: ExpenseFormProps) {
  const isEditing = Boolean(expense)
  const addExpense = useAddExpense()
  const updateExpense = useUpdateExpense()
  const isSubmitting = addExpense.isPending || updateExpense.isPending

  const form = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: emptyDefaults,
  })

  useEffect(() => {
    if (open) {
      form.reset(
        expense
          ? {
              expense_date: expense.expense_date,
              category: expense.category as ExpenseFormSchema["category"],
              description: expense.description ?? "",
              amount: expense.amount,
              supplier: expense.supplier ?? "",
              payment_method: expense.payment_method as ExpenseFormSchema["payment_method"],
            }
          : emptyDefaults
      )
    }
  }, [open, expense, form])

  function onSubmit(values: ExpenseFormSchemaOutput) {
    if (isEditing && expense) {
      updateExpense.mutate(
        { id: expense.id, values },
        { onSuccess: () => onOpenChange(false) }
      )
    } else {
      addExpense.mutate(values, { onSuccess: () => onOpenChange(false) })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit expense" : "Record an expense"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="expense_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₱)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        inputMode="decimal"
                        placeholder="0.00"
                        {...field}
                        value={field.value as number | string}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g. Whole chicken, 40 pcs" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Aling Nena's" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment method</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENT_METHODS.map((method) => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="mt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {isEditing ? "Save changes" : "Add expense"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}