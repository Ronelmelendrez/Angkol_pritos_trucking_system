import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { saleSchema, type SaleFormValues } from "@/utils/validators";
import { useProducts } from "@/features/products/hooks/useProducts";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { useAddSale } from "../hooks/useSales";
import { useToast } from "@/components/ui/useToast";
import { todayISO } from "@/utils/date";
import { formatCurrency } from "@/utils/currency";

interface Props {
  onDone?: () => void;
}

export function SaleForm({ onDone }: Props) {
  const { toast } = useToast();
  const addSale = useAddSale();
  const { data: products = [] } = useProducts();
  const activeProducts = products.filter((p) => p.isActive);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      date: todayISO(),
      productId: "",
      quantitySold: 1,
      unitPrice: 0,
      amount: 0,
      notes: "",
    },
  });

  const selectedProductId = useWatch({ control, name: "productId" });
  const quantitySold = useWatch({ control, name: "quantitySold" });
  const unitPrice = useWatch({ control, name: "unitPrice" });

  const selectedProduct = activeProducts.find((p) => p.id === selectedProductId);

  useEffect(() => {
    if (selectedProduct) {
      setValue("unitPrice", selectedProduct.defaultPrice);
    }
  }, [selectedProductId, setValue, selectedProduct]);

  useEffect(() => {
    const qty = Number(quantitySold) || 0;
    const price = Number(unitPrice) || 0;
    setValue("amount", qty * price);
  }, [quantitySold, unitPrice, setValue]);

  async function onSubmit(values: SaleFormValues) {
    try {
      await addSale.mutateAsync({
        date: values.date,
        productId: values.productId,
        quantitySold: values.quantitySold,
        unitPrice: values.unitPrice,
        amount: values.amount,
        notes: values.notes || undefined,
      });
      const product = activeProducts.find((p) => p.id === values.productId);
      toast({ title: "Sale recorded", description: `${product?.name ?? "Sale"} — ${formatCurrency(values.amount)}`, variant: "success" });
      reset({ date: todayISO(), productId: "", quantitySold: 1, unitPrice: 0, amount: 0, notes: "" });
      onDone?.();
    } catch {
      toast({ title: "Couldn't save sale", description: "Please try again.", variant: "error" });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sale-date">Date</Label>
          <Input id="sale-date" type="date" {...register("date")} />
          {errors.date && <p className="mt-1 text-xs text-danger">{errors.date.message}</p>}
        </div>
        <div>
          <Label htmlFor="sale-product">Product</Label>
          <Controller
            control={control}
            name="productId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="sale-product">
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
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="sale-qty">Quantity</Label>
          <Input id="sale-qty" type="number" step="1" min="1" {...register("quantitySold")} />
          {errors.quantitySold && <p className="mt-1 text-xs text-danger">{errors.quantitySold.message}</p>}
        </div>
        <div>
          <Label htmlFor="sale-price">Unit price (₱)</Label>
          <Input id="sale-price" type="number" step="0.01" min="0" {...register("unitPrice")} />
          {errors.unitPrice && <p className="mt-1 text-xs text-danger">{errors.unitPrice.message}</p>}
        </div>
        <div>
          <Label htmlFor="sale-amount">Total (₱)</Label>
          <Input id="sale-amount" type="number" step="0.01" min="0" {...register("amount")} />
          {errors.amount && <p className="mt-1 text-xs text-danger">{errors.amount.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="sale-notes">Notes (optional)</Label>
        <Input id="sale-notes" placeholder="e.g. Walk-in customer" {...register("notes")} />
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={addSale.isPending}>
        {addSale.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {addSale.isPending ? "Saving..." : "Record sale"}
      </Button>
    </form>
  );
}
