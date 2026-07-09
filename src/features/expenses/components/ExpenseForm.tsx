import { useForm, Controller, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { expenseSchema, type ExpenseFormValues } from "@/utils/validators";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS, isStockCategory } from "@/lib/constants";
import { useProducts } from "@/features/products/hooks/useProducts";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { useAddExpense } from "../hooks/useExpenses";
import { useToast } from "@/components/ui/useToast";
import { todayISO } from "@/utils/date";
import { formatCurrency } from "@/utils/currency";

export function ExpenseForm({ onDone }: { onDone?: () => void }) {
  const { toast } = useToast();
  const addExpense = useAddExpense();

  const { data: products = [] } = useProducts();
  const activeProducts = products.filter((p) => p.isActive);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema) as unknown as Resolver<ExpenseFormValues>,
    defaultValues: {
      date: todayISO(),
      category: "Raw Chicken",
      description: "",
      amount: 0,
      supplier: "",
      paymentMethod: "Cash",
      productId: "",
    },
  });

  const selectedCategory = useWatch({ control, name: "category" });
  const selectedProductId = useWatch({ control, name: "productId" });
  const isStock = isStockCategory(selectedCategory);
  const selectedProduct = activeProducts.find((p) => p.id === selectedProductId);

  async function onSubmit(values: ExpenseFormValues) {
    try {
      await addExpense.mutateAsync(values);
      toast({ title: "Expense recorded", description: `${values.description} — added.`, variant: "success" });
      reset({ date: todayISO(), category: values.category, description: "", amount: 0, supplier: "", paymentMethod: "Cash", productId: "" });
      onDone?.();
    } catch {
      toast({ title: "Couldn't save expense", description: "Please try again.", variant: "error" });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" {...register("date")} />
          {errors.date && <p className="mt-1 text-xs text-danger">{errors.date.message}</p>}
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Choose category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && <p className="mt-1 text-xs text-danger">{errors.category.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input id="description" placeholder="e.g. 10kg dressed chicken" {...register("description")} />
        {errors.description && <p className="mt-1 text-xs text-danger">{errors.description.message}</p>}
      </div>

      {isStock && (
        <div className="rounded-lg border border-line bg-bg/40 p-4 space-y-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Stock tracking</p>
          <div>
            <Label htmlFor="expense-product">Product</Label>
            <Controller
              control={control}
              name="productId"
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger id="expense-product">
                    <SelectValue placeholder="Choose product" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeProducts.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} — {formatCurrency(p.defaultPrice)}/{p.unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.productId && <p className="mt-1 text-xs text-danger">{errors.productId.message}</p>}
          </div>
          <div>
            <Label htmlFor="expense-qty">Quantity purchased ({selectedProduct?.unit ?? "units"})</Label>
            <Input id="expense-qty" type="number" step="0.01" min="0" {...register("quantityPurchased")} placeholder="0" />
            {errors.quantityPurchased && <p className="mt-1 text-xs text-danger">{errors.quantityPurchased.message}</p>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Amount (₱)</Label>
          <Input id="amount" type="number" step="0.01" min="0" {...register("amount")} />
          {errors.amount && <p className="mt-1 text-xs text-danger">{errors.amount.message}</p>}
        </div>
        <div>
          <Label htmlFor="paymentMethod">Payment method</Label>
          <Controller
            control={control}
            name="paymentMethod"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="Choose method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="supplier">Supplier (optional)</Label>
        <Input id="supplier" placeholder="e.g. San Pedro Poultry" {...register("supplier")} />
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={addExpense.isPending}>
        {addExpense.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {addExpense.isPending ? "Saving..." : "Save expense"}
      </Button>
    </form>
  );
}