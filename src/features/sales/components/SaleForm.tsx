import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { saleSchema, type SaleFormValues } from "@/utils/Validators";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useActiveBranches } from "@/features/branches/hooks/useBranches";
import { useAuth } from "@/features/auth/hooks/useAuth";
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
  const { data: branches = [] } = useActiveBranches();
  const { user } = useAuth();
  const activeProducts = products.filter((p) => p.isActive);

  const isStaff = user?.role === "staff";
  const staffBranchId = user?.branchId;

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      date: todayISO(),
      productId: "",
      quantitySold: 0,
      unitPrice: 0,
      amount: 0,
      notes: "",
      branchId: staffBranchId ?? "",
    },
  });

  const selectedProductId = useWatch({ control, name: "productId" });
  const amount = useWatch({ control, name: "amount" });
  const quantitySold = useWatch({ control, name: "quantitySold" });
  const unitPrice = useWatch({ control, name: "unitPrice" });

  const selectedProduct = activeProducts.find((p) => p.id === selectedProductId);

  useEffect(() => {
    if (selectedProduct) {
      setValue("unitPrice", selectedProduct.defaultPrice);
    }
  }, [selectedProductId, setValue, selectedProduct]);

  function onAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value) || 0;
    setValue("amount", val);
    const price = unitPrice || 0;
    if (price > 0) {
      setValue("quantitySold", Math.round((val / price) * 100) / 100);
    }
  }

  function onQtyChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value) || 0;
    setValue("quantitySold", val);
    const price = unitPrice || 0;
    setValue("amount", Math.round(val * price * 100) / 100);
  }

  async function onSubmit(values: SaleFormValues) {
    try {
      // Ensure branchId is set (required for NewSale)
      const submitValues = {
        ...values,
        branchId: isStaff ? staffBranchId : values.branchId,
      } as SaleFormValues & { branchId: string };
      
      await addSale.mutateAsync(submitValues);
      const product = activeProducts.find((p) => p.id === values.productId);
      toast({ title: "Sale recorded", description: `${product?.name ?? "Sale"} — ${formatCurrency(values.amount)}`, variant: "success" });
      reset({ date: todayISO(), productId: "", quantitySold: 0, unitPrice: 0, amount: 0, notes: "", branchId: staffBranchId ?? "" });
      onDone?.();
    } catch {
      toast({ title: "Couldn't save sale", description: "Please try again.", variant: "error" });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {!isStaff && branches.length > 0 && (
        <div>
          <Label htmlFor="sale-branch">Branch</Label>
          <Controller
            control={control}
            name="branchId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="sale-branch">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.branchId && <p className="mt-1 text-xs text-danger">{errors.branchId.message}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="sale-amount">Total sales (₱)</Label>
          <Input id="sale-amount" type="number" step="0.01" min="0" value={amount || ""} onChange={onAmountChange} placeholder="0" />
          {errors.amount && <p className="mt-1 text-xs text-danger">{errors.amount.message}</p>}
        </div>
        <div>
          <Label htmlFor="sale-price">Unit price (₱)</Label>
          <Input id="sale-price" type="number" disabled value={unitPrice || 0} />
        </div>
        <div>
          <Label htmlFor="sale-qty">Quantity</Label>
          <Input id="sale-qty" type="number" step="0.01" min="0" value={quantitySold || ""} onChange={onQtyChange} placeholder="0" />
          {errors.quantitySold && <p className="mt-1 text-xs text-danger">{errors.quantitySold.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="sale-notes">Notes (optional)</Label>
        <Input id="sale-notes" placeholder="e.g. Walk-in customer" {...register("notes")} />
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={addSale.isPending || !selectedProductId || (!isStaff && !branches.some(b => b.id === getValues().branchId))}>
        {addSale.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {addSale.isPending ? "Saving..." : "Record sale"}
      </Button>
    </form>
  );
}
