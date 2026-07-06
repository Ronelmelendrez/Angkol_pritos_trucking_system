import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { saleSchema, type SaleFormValues } from "@/utils/validators";
import { useExpenses } from "@/features/expenses/hooks/useExpenses";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { useAddSale } from "../hooks/useSales";
import { useToast } from "@/components/ui/useToast";
import { todayISO } from "@/utils/date";

interface Props {
  preselectedExpenseId?: string;
  onDone?: () => void;
}

export function SaleForm({ preselectedExpenseId, onDone }: Props) {
  const { toast } = useToast();
  const addSale = useAddSale();
  const { data: expenses = [] } = useExpenses();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      date: todayISO(),
      expenseId: preselectedExpenseId ?? "",
      description: "",
      quantitySold: undefined,
      amount: 0,
    },
  });

  async function onSubmit(values: SaleFormValues) {
    try {
      await addSale.mutateAsync({
        date: values.date,
        expenseId: values.expenseId || undefined,
        description: values.description,
        quantitySold: values.quantitySold || undefined,
        amount: values.amount,
      });
      toast({ title: "Sale recorded", description: `${values.description} — ₱${values.amount.toFixed(2)}`, variant: "success" });
      reset({ ...values, description: "", quantitySold: undefined, amount: 0 });
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
          <Label htmlFor="sale-amount">Amount (₱)</Label>
          <Input id="sale-amount" type="number" step="0.01" min="0" {...register("amount")} />
          {errors.amount && <p className="mt-1 text-xs text-danger">{errors.amount.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="sale-description">Description</Label>
        <Input id="sale-description" placeholder="e.g. Fried chicken, walk-in" {...register("description")} />
        {errors.description && <p className="mt-1 text-xs text-danger">{errors.description.message}</p>}
      </div>

      <div>
        <Label htmlFor="sale-expense">Linked expense (optional)</Label>
        <Controller
          control={control}
          name="expenseId"
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger id="sale-expense">
                <SelectValue placeholder="None — walk-in sale" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None — walk-in sale</SelectItem>
                {expenses.map((exp) => (
                  <SelectItem key={exp.id} value={exp.id}>
                    {exp.description} — {exp.category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div>
        <Label htmlFor="sale-qty">Quantity sold (optional)</Label>
        <Input id="sale-qty" type="number" step="0.1" min="0" placeholder="e.g. 20 kg" {...register("quantitySold")} />
        {errors.quantitySold && <p className="mt-1 text-xs text-danger">{errors.quantitySold.message}</p>}
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={addSale.isPending}>
        {addSale.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {addSale.isPending ? "Saving..." : "Record sale"}
      </Button>
    </form>
  );
}
