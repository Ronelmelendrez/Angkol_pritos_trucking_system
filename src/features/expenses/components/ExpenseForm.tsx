import { useForm, Controller, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
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
    watch,
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
      items: [],
    },
  });

  const selectedCategory = useWatch({ control, name: "category" });
  const isStock = isStockCategory(selectedCategory);
  const items = watch("items") ?? [];

  function addItem() {
    const current = watch("items") ?? [];
    setValue("items", [...current, { productId: "", quantityPurchased: 0 }], { shouldValidate: true });
  }

  function removeItem(index: number) {
    const current = watch("items") ?? [];
    setValue("items", current.filter((_, i) => i !== index), { shouldValidate: true });
  }

  function updateItem(index: number, field: "productId" | "quantityPurchased", value: string | number) {
    const current = watch("items") ?? [];
    const updated = current.map((item, i) => {
      if (i !== index) return item;
      if (field === "quantityPurchased") {
        const str = String(value);
        if (str === "" || str.endsWith(".")) {
          return { ...item, quantityPurchased: str === "" ? 0 : parseFloat(str) || 0, _raw: str };
        }
        const parsed = parseFloat(str);
        return { ...item, quantityPurchased: isNaN(parsed) ? 0 : parsed, _raw: str };
      }
      return { ...item, [field]: value };
    });
    setValue("items", updated, { shouldValidate: true });
  }

  async function onSubmit(values: ExpenseFormValues) {
    if (isStock) {
      const validItems = (values.items ?? []).filter(
        (i) => i.productId && i.productId !== "" && i.quantityPurchased > 0
      );
      if (validItems.length === 0) {
        toast({ title: "Add at least one product with quantity", description: "Stock expenses require a product and quantity.", variant: "error" });
        return;
      }
      values.items = validItems;
    }

    try {
      await addExpense.mutateAsync(values);
      toast({ title: "Expense recorded", description: `${values.description} — added.`, variant: "success" });
      reset({ date: todayISO(), category: values.category, description: "", amount: 0, supplier: "", paymentMethod: "Cash", productId: "", items: [] });
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
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Stock tracking</p>
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add product
            </Button>
          </div>

          {items.length === 0 && (
            <p className="text-xs text-ink-faint">No products added. Click "Add product" to track stock.</p>
          )}

          {items.map((item, index) => (
            <div key={index} className="flex items-end gap-3 rounded-lg border border-line bg-surface p-3">
              <div className="flex-1">
                <Label className="text-xs">Product</Label>
                <Select value={item.productId} onValueChange={(v) => updateItem(index, "productId", v)}>
                  <SelectTrigger>
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
              </div>
              <div className="w-32">
                <Label className="text-xs">Quantity</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*\.?[0-9]*"
                  value={(item as any)._raw ?? (item.quantityPurchased || "")}
                  onChange={(e) => updateItem(index, "quantityPurchased", e.target.value)}
                  placeholder="0"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 text-ink-faint hover:text-danger"
                onClick={() => removeItem(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {errors.items && <p className="text-xs text-danger">{errors.items.message}</p>}
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