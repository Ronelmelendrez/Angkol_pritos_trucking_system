import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2 } from "lucide-react";
import { orderSchema, type OrderFormValues } from "@/utils/Validators";
import { useProducts } from "@/features/products/hooks/useProducts";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useAddOrder } from "../hooks/useOrders";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useToast } from "@/components/ui/useToast";
import { todayISO } from "@/utils/date";
import { formatCurrency } from "@/utils/currency";
import { OrderConfirmationDialog } from "./OrderConfirmationDialog";
import type { Order } from "../types";

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

  const [confirmationOrder, setConfirmationOrder] = useState<Order | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      date: todayISO(),
      customerName: "",
      contactNumber: "",
      status: "scheduled",
      depositAmount: 0,
      notes: "",
      items: [{ productId: "", quantity: 0 }],
      scheduledTime: "",
    },
  });

  const items = (useWatch({ control, name: "items" }) ?? []) as unknown as FormItem[];

  function addItem() {
    const current = watch("items") ?? [];
    const next = [...current, { productId: "", quantity: 0 }];
    reset({ ...watch(), items: next }, { keepDefaultValues: false });
  }

  function removeItem(index: number) {
    const current = watch("items") ?? [];
    const next = current.filter((_: unknown, i: number) => i !== index);
    reset({ ...watch(), items: next.length > 0 ? next : [{ productId: "", quantity: 0 }] }, { keepDefaultValues: false });
  }

  function updateItem(index: number, field: "productId" | "quantity", value: string | number) {
    const current = (watch("items") ?? []) as FormItem[];
    const updated = current.map((item, i) => {
      if (i !== index) return item;
      if (field === "quantity") {
        const str = String(value);
        if (str === "" || str.endsWith(".")) {
          return { ...item, quantity: str === "" ? 0 : parseFloat(str) || 0, _raw: str };
        }
        return { ...item, quantity: parseFloat(str) || 0, _raw: str };
      }
      return { ...item, productId: String(value) };
    });
    reset({ ...watch(), items: updated }, { keepDefaultValues: false });
  }

  const orderTotal = items.reduce((sum, item) => {
    const product = productMap.get(item?.productId);
    return sum + (product?.defaultPrice ?? 0) * (item?.quantity ?? 0);
  }, 0);

  const depositAmount = useWatch({ control, name: "depositAmount" }) ?? 0;
  const balanceAmount = orderTotal - depositAmount;

  async function onSubmit(values: OrderFormValues) {
    const total = values.items.reduce((sum, item) => {
      const product = productMap.get(item.productId);
      return sum + (product?.defaultPrice ?? 0) * item.quantity;
    }, 0);

    const deposit = values.depositAmount ?? 0;
    const balance = total - deposit;

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
      const result = await addOrder.mutateAsync({
        orderNumber: "",
        date: values.date,
        scheduledTime: values.scheduledTime || undefined,
        customerName: values.customerName,
        contactNumber: values.contactNumber,
        status: "scheduled",
        total,
        depositAmount: deposit,
        balanceAmount: balance,
        notes: values.notes,
        createdBy: user?.id,
        branchId: user?.branchId,
        items: orderItems,
      });

      setConfirmationOrder(result);

      toast({ title: "Order scheduled", description: `${values.customerName} — ${formatCurrency(total)}`, variant: "success" });
      reset({
        date: todayISO(),
        scheduledTime: "",
        customerName: "",
        contactNumber: "",
        status: "scheduled",
        depositAmount: 0,
        notes: "",
        items: [{ productId: "", quantity: 0 }],
      });
    } catch {
      toast({ title: "Couldn't save order", description: "Please try again.", variant: "error" });
    }
  }

  function handleConfirmationClose() {
    setConfirmationOrder(null);
    setTimeout(() => onDone?.(), 0);
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

        <div>
          <Label htmlFor="order-contact">Contact number</Label>
          <Input id="order-contact" placeholder="e.g. 09171234567" {...register("contactNumber")} />
          {errors.contactNumber && <p className="mt-1 text-xs text-danger">{errors.contactNumber.message}</p>}
        </div>

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
                  <select
                    value={item?.productId ?? ""}
                    onChange={(e) => updateItem(index, "productId", e.target.value)}
                    className="h-9 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink outline-none focus:border-primary"
                  >
                    <option value="">Choose product</option>
                    {activeProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {formatCurrency(p.defaultPrice)}/{p.unit}
                      </option>
                    ))}
                  </select>
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

        <div className="rounded-xl border border-line bg-ink/[0.02] px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-ink-soft">Total</span>
            <span className="text-lg font-bold text-ink">{formatCurrency(orderTotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="order-deposit" className="text-sm text-ink-soft">Deposit</Label>
            <div className="w-36">
              <Input
                id="order-deposit"
                type="number"
                step="0.01"
                min="0"
                max={orderTotal}
                {...register("depositAmount", { valueAsNumber: true })}
                className="h-8 text-right text-sm"
              />
            </div>
          </div>
          {errors.depositAmount && <p className="text-xs text-danger text-right">{errors.depositAmount.message}</p>}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-ink-soft">Balance</span>
            <span className={`text-lg font-bold ${balanceAmount < 0 ? "text-danger" : "text-ink"}`}>
              {formatCurrency(balanceAmount < 0 ? 0 : balanceAmount)}
            </span>
          </div>
        </div>

        <div>
          <Label htmlFor="order-notes">Notes (optional)</Label>
          <Input id="order-notes" placeholder="e.g. Delivery to Makati" {...register("notes")} />
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={addOrder.isPending}>
          {addOrder.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {addOrder.isPending ? "Saving..." : "Schedule order"}
        </Button>
      </form>

      <OrderConfirmationDialog order={confirmationOrder} onClose={handleConfirmationClose} />
    </>
  );
}
