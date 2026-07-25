import { useState } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2, Package, PackagePlus } from "lucide-react";
import { expenseSchema, type ExpenseFormValues } from "@/utils/validators";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/lib/constants";
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
  const [trackStock, setTrackStock] = useState(false);

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
      category: EXPENSE_CATEGORIES[0],
      description: "",
      amount: 0,
      supplier: "",
      paymentMethod: "Cash",
      productId: "",
      items: [],
    },
  });

  type ExpenseItem = NonNullable<ExpenseFormValues["items"]>[number] & { _raw?: string };

  const items = (watch("items") ?? []) as ExpenseItem[];

  function toggleStock() {
    const next = !trackStock;
    setTrackStock(next);
    if (next) {
      // Seed with one empty row when turning on
      const current = watch("items") ?? [];
      if (current.length === 0) {
        setValue("items", [{ productId: "", quantityPurchased: 0 }], { shouldValidate: true });
      }
    } else {
      // Clear items when turning off
      setValue("items", [], { shouldValidate: true });
    }
  }

  function addItem() {
    const current = watch("items") ?? [];
    setValue(
      "items",
      [...current, { productId: "", quantityPurchased: 0 }],
      { shouldValidate: true }
    );
  }

  function removeItem(index: number) {
    const current = watch("items") ?? [];
    const next = current.filter((_, i) => i !== index);
    setValue("items", next, { shouldValidate: true });
    if (next.length === 0) setTrackStock(false);
  }

  function updateItem(index: number, field: "productId" | "quantityPurchased", value: string | number) {
    const current = watch("items") ?? [];
    const updated = current.map((item, i) => {
      if (i !== index) return item;
      if (field === "quantityPurchased") {
        const str = String(value);
        if (str === "" || str.endsWith(".")) {
          return { productId: item.productId, quantityPurchased: str === "" ? 0 : parseFloat(str) || 0, _raw: str };
        }
        const parsed = parseFloat(str);
        return { productId: item.productId, quantityPurchased: isNaN(parsed) ? 0 : parsed, _raw: str };
      }
      return { ...item, productId: String(value) };
    });
    setValue("items", updated as ExpenseFormValues["items"], { shouldValidate: true });
  }

  // Auto-calculate total from product prices × quantities
  const computedAmount = trackStock
    ? items.reduce((sum, item) => {
        const product = activeProducts.find((p) => p.id === item.productId);
        if (!product || !item.quantityPurchased) return sum;
        return sum + product.defaultPrice * item.quantityPurchased;
      }, 0)
    : null;

  // Keep amount field synced
  const amountSource = computedAmount !== null && computedAmount > 0 ? "auto" : "manual";

  async function onSubmit(values: ExpenseFormValues) {
    if (trackStock) {
      const validItems = (values.items ?? []).filter(
        (i) => i.productId && i.productId !== "" && i.quantityPurchased > 0
      );
      if (validItems.length === 0) {
        toast({
          title: "Add at least one product with quantity",
          description: "Stock tracking requires a product and quantity.",
          variant: "error",
        });
        return;
      }
      values.items = validItems;
    } else {
      values.items = [];
    }

    try {
      await addExpense.mutateAsync(values);
      toast({
        title: "Expense recorded",
        description: `${values.description} — added.`,
        variant: "success",
      });
      reset({
        date: todayISO(),
        category: values.category,
        description: "",
        amount: 0,
        supplier: "",
        paymentMethod: "Cash",
        productId: "",
        items: [],
      });
      setTrackStock(false);
      onDone?.();
    } catch {
      toast({
        title: "Couldn't save expense",
        description: "Please try again.",
        variant: "error",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Date + Category */}
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
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && <p className="mt-1 text-xs text-danger">{errors.category.message}</p>}
        </div>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <Input id="description" placeholder="e.g. 10kg dressed chicken" {...register("description")} />
        {errors.description && <p className="mt-1 text-xs text-danger">{errors.description.message}</p>}
      </div>

      {/* Stock tracking toggle */}
      {activeProducts.length > 0 && (
        <button
          type="button"
          onClick={toggleStock}
          className={`w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-2.5 text-sm font-medium transition-colors ${
            trackStock
              ? "border-annatto-400 bg-annatto-50/50 text-annatto-700"
              : "border-line text-ink-faint hover:border-annatto-300 hover:text-annatto-600"
          }`}
        >
          {trackStock ? (
            <>
              <Package className="h-4 w-4" />
              Tracking stock — click to remove
            </>
          ) : (
            <>
              <PackagePlus className="h-4 w-4" />
              Track stock for this expense
            </>
          )}
        </button>
      )}

      {/* Stock product rows */}
      {trackStock && (
        <div className="rounded-lg border border-annatto-200 bg-annatto-50/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-annatto-700">
              Stock items
            </p>
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add product
            </Button>
          </div>

          {items.length === 0 && (
            <p className="text-xs text-annatto-600">Click "Add product" to start tracking stock.</p>
          )}

          {items.map((item, index) => (
              <div key={index} className="flex items-end gap-2 rounded-lg border border-line bg-surface p-3">
                <div className="flex-1 min-w-0">
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
                <div className="w-24">
                  <Label className="text-xs">Qty</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*\.?[0-9]*"
                    value={item._raw ?? (item.quantityPurchased || "")}
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

      {/* Amount + Payment method */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">
            Amount (₱)
            {amountSource === "auto" && (
              <span className="ml-1 text-xs font-normal text-annatto-500">auto</span>
            )}
          </Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            {...register("amount")}
            readOnly={amountSource === "auto"}
            className={amountSource === "auto" ? "bg-muted" : ""}
          />
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

      {/* Supplier */}
      <div>
        <Label htmlFor="supplier">Supplier (optional)</Label>
        <Input id="supplier" placeholder="e.g. San Pedro Poultry" {...register("supplier")} />
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" size="lg" disabled={addExpense.isPending}>
        {addExpense.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {addExpense.isPending ? "Saving..." : "Save expense"}
      </Button>
    </form>
  );
}
