import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { repaymentSchema, type RepaymentFormValues } from "@/utils/validators";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useRepayLoan } from "../hooks/useLoans";
import { useToast } from "@/components/ui/useToast";
import { formatCurrency } from "@/utils/currency";
import { todayISO } from "@/utils/date";
import type { Loan } from "../types";

export function RepaymentForm({ loan, onDone }: { loan: Loan; onDone?: () => void }) {
  const { toast } = useToast();
  const repayLoan = useRepayLoan();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RepaymentFormValues>({
    resolver: zodResolver(repaymentSchema) as unknown as Resolver<RepaymentFormValues>,
    defaultValues: { amount: 0, date: todayISO() },
  });

  async function onSubmit(values: RepaymentFormValues) {
    if (values.amount > loan.remainingBalance) {
      toast({
        title: "Amount exceeds balance",
        description: `Remaining balance is ${formatCurrency(loan.remainingBalance)}`,
        variant: "error",
      });
      return;
    }
    try {
      await repayLoan.mutateAsync({ ...values, loanId: loan.id, loan });
      toast({ title: "Repayment recorded", variant: "success" });
      onDone?.();
    } catch {
      toast({ title: "Couldn't record repayment", variant: "error" });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-ink-soft">
        Remaining balance: <span className="font-semibold text-ink">{formatCurrency(loan.remainingBalance)}</span>
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Payment amount (₱)</Label>
          <Input id="amount" type="number" step="0.01" min="0" {...register("amount")} />
          {errors.amount && <p className="mt-1 text-xs text-danger">{errors.amount.message}</p>}
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" {...register("date")} />
        </div>
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={repayLoan.isPending}>
        {repayLoan.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {repayLoan.isPending ? "Saving..." : "Record repayment"}
      </Button>
    </form>
  );
}