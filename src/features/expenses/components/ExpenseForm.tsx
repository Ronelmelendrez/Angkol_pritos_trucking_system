import { useState } from "react";
import { useForm, Controller, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2, Package, PackagePlus } from "lucide-react";
import { expenseSchema, type ExpenseFormValues } from "@/utils/Validators";
import {
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  EXPENSE_FUND_SOURCES,
  FUND_SOURCE_LABELS,
} from "@/lib/constants";
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
      fundSource: "cash_drawer",
      productId: "",
      items: [],
    },
  });

  type ExpenseItem = NonNullable<ExpenseFormValues["items"]>[number] & { _raw?: string };

  const items = (useWatch({ control, name: "items" }) ?? []) as ExpenseItem[];
  const paymentMethod = watch("paymentMethod");
  const fundSource = watch("fundSource");

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

    if (values.paymentMethod !== "Cash") {
      values.fundSource = undefined;
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
        fundSource: "cash_drawer",
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
      {!trackStock ? (
        <button
          type="button"
          onClick={toggleStock}
          className="w-full flex items-center gap-3 rounded-lg border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-sm font-medium text-primary-dark hover:border-primary/40 hover:bg-primary/10 transition-colors"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary-dark">
            <PackagePlus className="h-4 w-4" />
          </span>
          <span className="flex flex-col items-start">
            <span className="leading-tight">Track stock for this expense</span>
            <span className="text-xs font-normal text-primary-dark/70">Link purchased items to your inventory</span>
          </span>
        </button>
      ) : (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-primary-dark">
              <Package className="h-4 w-4" />
              Tracking stock
            </div>
            <button
              type="button"
              onClick={toggleStock}
              className="text-xs text-ink-faint hover:text-danger transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Stock product rows */}
      {trackStock && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
              Stock items
            </p>
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add product
            </Button>
          </div>

          {items.length === 0 && (
            <p className="text-xs text-primary-dark">Click "Add product" to start tracking stock.</p>
          )}

          {items.map((item, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-3 sm:flex-row sm:items-end sm:gap-2"
              >
                <div className="min-w-0 flex-1">
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
                <div className="flex items-end gap-2">
                  <div className="flex-1 sm:w-24 sm:flex-none">
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
              </div>
            ))}
          {errors.items && <p className="text-xs text-danger">{errors.items.message}</p>}
        </div>
      )}

      {/* Amount + Payment method */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="amount">Amount (₱)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            {...register("amount")}
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

      {/* Fund source — only relevant when paying in cash */}
      {paymentMethod === "Cash" && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
          <Label htmlFor="fundSource">Where is this paid from?</Label>
          <div className="mt-2">
            <Controller
              control={control}
              name="fundSource"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="fundSource">
                    <SelectValue placeholder="Choose fund source" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_FUND_SOURCES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {FUND_SOURCE_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <p className="mt-2 text-xs text-primary-dark/70">
            {fundSource === "separate"
              ? "Paid from separate money — NOT counted in the daily cash drawer report."
              : "Paid from daily sales — counted in the daily cash drawer report."}
          </p>
        </div>
      )}

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
