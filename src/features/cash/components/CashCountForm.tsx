import { useEffect, useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { useCashCounts, useUpsertCashCount } from "../hooks/useCashCounts";
import { useToast } from "@/components/ui/useToast";
import { formatCurrency } from "@/utils/currency";
import { cn } from "@/utils/cn";
import type { CashCountFormValues } from "../types";

const schema = z.object({
  actualCash: z.coerce.number().min(0, "Cannot be negative"),
  remarks: z.string().optional(),
});

export function CashCountForm({
  date,
  expectedCash,
  onDone,
}: {
  date: string;
  expectedCash: number;
  onDone?: () => void;
}) {
  const { toast } = useToast();
  const { data: counts = [] } = useCashCounts();
  const upsertCount = useUpsertCashCount();

  const existing = counts.find((c) => c.date === date) ?? null;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CashCountFormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<CashCountFormValues>,
    defaultValues: { date, actualCash: expectedCash, remarks: "" },
  });

  useEffect(() => {
    if (existing) {
      reset({ date, actualCash: existing.actualCash, remarks: existing.remarks ?? "" });
    } else {
      reset({ date, actualCash: expectedCash, remarks: "" });
    }
  }, [existing, expectedCash, date, reset]);

  const actual = watch("actualCash");
  const difference = useMemo(() => (Number.isFinite(actual) ? actual - expectedCash : 0), [actual, expectedCash]);
  const isShort = difference < 0;

  async function onSubmit(values: CashCountFormValues) {
    try {
      await upsertCount.mutateAsync({
        date,
        expectedCash,
        actualCash: values.actualCash,
        difference,
        remarks: values.remarks || undefined,
      });
      toast({
        title: existing ? "Cash count updated" : "Cash count submitted",
        description: isShort ? "Cash shortage recorded." : difference > 0 ? "Cash overage recorded." : "Cash is balanced.",
        variant: "success",
      });
      onDone?.();
    } catch {
      toast({ title: "Couldn't save cash count", variant: "error" });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Expected cash</Label>
          <div className="flex h-10 items-center rounded-lg border border-line bg-ink/5 px-3 text-sm font-semibold text-ink">
            {formatCurrency(expectedCash)}
          </div>
        </div>
        <div>
          <Label htmlFor="actualCash">Actual cash count</Label>
          <Input id="actualCash" type="number" step="0.01" min="0" {...register("actualCash")} />
          {errors.actualCash && <p className="mt-1 text-xs text-danger">{errors.actualCash.message}</p>}
        </div>
      </div>

      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium",
          difference === 0
            ? "border-success/30 bg-success-bg text-success"
            : "border-danger/30 bg-danger-bg text-danger",
        )}
      >
        {difference === 0 ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        <span>Difference: {formatCurrency(difference)}</span>
        <span className="ml-auto text-xs font-normal opacity-80">
          {difference === 0 ? "Balanced" : isShort ? "Shortage" : "Overage"}
        </span>
      </div>

      <div>
        <Label htmlFor="remarks">Remarks (optional)</Label>
        <Textarea id="remarks" placeholder="e.g. Cash shortage — possible miscount" {...register("remarks")} />
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={upsertCount.isPending}>
        {upsertCount.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {upsertCount.isPending ? "Saving..." : existing ? "Update cash count" : "Submit cash count"}
      </Button>
    </form>
  );
}
