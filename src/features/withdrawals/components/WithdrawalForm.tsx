import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { withdrawalSchema, type WithdrawalFormValues } from "@/utils/Validators";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useAddOwnerWithdrawal } from "../hooks/useWithdrawals";
import { useToast } from "@/components/ui/useToast";
import { todayISO } from "@/utils/date";

export function WithdrawalForm({ onDone }: { onDone?: () => void }) {
  const { toast } = useToast();
  const addWithdrawal = useAddOwnerWithdrawal();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalSchema) as unknown as Resolver<WithdrawalFormValues>,
    defaultValues: { amount: 0, date: todayISO(), reason: "" },
  });

  async function onSubmit(values: WithdrawalFormValues) {
    try {
      await addWithdrawal.mutateAsync(values);
      toast({ title: "Withdrawal recorded", description: "Owner cash-out saved.", variant: "success" });
      reset({ amount: 0, date: todayISO(), reason: "" });
      onDone?.();
    } catch {
      toast({ title: "Couldn't save withdrawal", variant: "error" });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Amount (₱)</Label>
          <Input id="amount" type="number" step="0.01" min="0" {...register("amount")} />
          {errors.amount && <p className="mt-1 text-xs text-danger">{errors.amount.message}</p>}
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" {...register("date")} />
          {errors.date && <p className="mt-1 text-xs text-danger">{errors.date.message}</p>}
        </div>
      </div>
      <div>
        <Label htmlFor="reason">Reason (optional)</Label>
        <Input id="reason" placeholder="e.g. Personal cash-out, supplies for home" {...register("reason")} />
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={addWithdrawal.isPending}>
        {addWithdrawal.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {addWithdrawal.isPending ? "Saving..." : "Record withdrawal"}
      </Button>
    </form>
  );
}
