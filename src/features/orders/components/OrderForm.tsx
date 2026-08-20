import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2 } from "lucide-react";
import { orderSchema, type OrderFormValues } from "@/utils/Validators";
import { useProducts } from "@/features/products/hooks/useProducts";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { useAddOrder } from "../hooks/useOrders";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useToast } from "@/components/ui/useToast";
import { todayISO } from "@/utils/date";
import { formatCurrency } from "@/utils/currency";

interface Props {
  onDone?: () => void;
}

type FormItem = { productId: string; quantity: number; _raw?: string };

export function OrderForm({ onDone }: Props) {
  const { toast } = useToast();
  const addOrder = useAddOrder();
  const { user } = useAuth();
  const { data: products = [] } = useProducts();
  const activeProducts = products.filter((p) => p.isActive);

  const productMap = new Map(activeProducts.map((p) => [p.id, p]));

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      date: todayISO(),
      customerName: "",
      status: "pending",
      notes: "",
      items: [{ productId: "", quantity: 0 }],
      scheduledTime: "",
    },
  });

  const items = (useWatch({ control, name: "items" }) ?? []) as unknown as FormItem[];

  function addItem() {
    const current = watch("items") ?? [];
    setValue("items", [...current, { productId: "", quantity: 0 }], { shouldValidate: true });
  }

  function removeItem(index: number) {
    const current = watch("items") ?? [];
    const next = current.filter((_: unknown, i: number) => i !== index);
    setValue("items", next, { shouldValidate: true });
  }

  function updateItem(index: number, field: "productId" | "quantity", value: string | number) {
    const current = (watch("items") ?? []) as FormItem[];
    const updated = current.map((item, i) => {
      if (i !== index) return item;
      if (field === "quantity") {
        const str = String(value);
        if (str === "" || str.endsWith(".")) {
          const parsed = str === "" ? 0 : parseFloat(str) || 0;
          return { ...item, quantity: parsed, _raw: str };
        }
        const parsed = parseFloat(str) || 0;
        return { ...item, quantity: parsed, _raw: str };
      }
      return { ...item, productId: String(value) };
    });
    setValue("items", updated as OrderFormValues["items"], { shouldValidate: true });
  }

  const orderTotal = items.reduce((sum, item) => {
    const product = productMap.get(item?.productId);
    return sum + (product?.defaultPrice ?? 0) * (item?.quantity ?? 0);
  }, 0);

  async function onSubmit(values: OrderFormValues) {
    const total = values.items.reduce((sum, item) => {
      const product = productMap.get(item.productId);
      return sum + (product?.defaultPrice ?? 0) * item.quantity;
    }, 0);

    const orderItems = values.items.map((item) => {
      const product = productMap.get(item.productId);
      const unitPrice = product?.defaultPrice ?? 0;
      const qty = Math.floor(item.quantity);
      return {
        productId: item.productId,
        quantity: qty,
        unitPrice,
        amount: Math.round(unitPrice * qty * 100) / 100,
      };
    });

    try {
      await addOrder.mutateAsync({
        date: values.date,
        scheduledTime: values.scheduledTime || undefined,
        customerName: values.customerName,
        status: values.status,
        total,
        notes: values.notes,
        createdBy: user?.id,
        items: orderItems,
      });
      toast({ title: "Order scheduled", description: `${values.customerName} — ${formatCurrency(total)}`, variant: "success" });
      reset({
        date: todayISO(),
        scheduledTime: "",
        customerName: "",
        status: "pending",
        notes: "",
        items: [{ productId: "", quantity: 0 }],
      });
      setTimeout(() => onDone?.(), 0);
    } catch {
      toast({ title: "Couldn't save order", description: "Please try again.", variant: "error" });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Date + Time + Customer */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="order-date">Pick-up date</Label>
          <Input id="order-date" type="date" {...register("date")} />
          {errors.date && <p className="mt-1 text-xs text-danger">{errors.date.message}</p>}
        </div>
        <div>
          <Label htmlFor="order-time">Time</Label>
          <Input id="order-time" type="time" {...register("scheduledTime")} />
        </div>
        <div>
          <Label htmlFor="order-customer">Customer name</Label>
          <Input id="order-customer" placeholder="e.g. Juan Dela Cruz" {...register("customerName")} />
          {errors.customerName && <p className="mt-1 text-xs text-danger">{errors.customerName.message}</p>}
        </div>
      </div>

      {/* Items */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
            Order items
          </p>
          <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1.5">
            Add item
          </Button>
        </div>

        {items.map((item, index) => {
          const product = productMap.get(item?.productId);
          const lineTotal = (product?.defaultPrice ?? 0) * (item?.quantity ?? 0);
          return (
            <div
              key={index}
              className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-3 sm:flex-row sm:items-end sm:gap-2"
            >
              <div className="min-w-0 flex-1">
                <Label className="text-xs">Product</Label>
                <Select value={item?.productId ?? ""} onValueChange={(v) => updateItem(index, "productId", v)}>
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
                    value={item?._raw ?? (item?.quantity || "")}
                    onChange={(e) => updateItem(index, "quantity", e.target.value)}
                    placeholder="0"
                  />
                </div>
                {product && (
                  <span className="hidden whitespace-nowrap pb-0.5 text-xs text-ink-faint sm:inline">
                    {formatCurrency(lineTotal)}
                  </span>
                )}
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
          );
        })}
        {errors.items && <p className="text-xs text-danger">{errors.items.message}</p>}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between rounded-xl border border-line bg-ink/[0.02] px-4 py-3">
        <span className="text-sm font-medium text-ink-soft">Total</span>
        <span className="text-lg font-bold text-ink">{formatCurrency(orderTotal)}</span>
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="order-notes">Notes (optional)</Label>
        <Input id="order-notes" placeholder="e.g. Delivery to Makati" {...register("notes")} />
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" size="lg" disabled={addOrder.isPending}>
        {addOrder.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {addOrder.isPending ? "Saving..." : "Schedule order"}
      </Button>
    </form>
  );
}
