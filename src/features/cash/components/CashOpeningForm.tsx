import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useCashOpenings, useUpsertCashOpening } from "../hooks/useCashOpenings";
import { usePayRuleSettings } from "@/features/settings/hooks/usePayRuleSettings";
import { useToast } from "@/components/ui/useToast";
import { formatCurrency } from "@/utils/currency";
import type { CashOpeningFormValues } from "../types";

const schema = z.object({
  openingCash: z.coerce.number().min(0, "Cannot be negative"),
});

export function CashOpeningForm({ date, branchId, onDone }: { date: string; branchId: string; onDone?: () => void }) {
  const { toast } = useToast();
  const { data: settings } = usePayRuleSettings();
  const { data: openings = [] } = useCashOpenings(branchId);
  const upsertOpening = useUpsertCashOpening();

  const existing = openings.find((o) => o.date === date) ?? null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CashOpeningFormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<CashOpeningFormValues>,
    defaultValues: { date, openingCash: 0 },
  });

  useEffect(() => {
    if (existing) {
      reset({ date, openingCash: existing.openingCash });
    } else if (settings) {
      reset({ date, openingCash: settings.defaultOpeningCash });
    }
  }, [existing, settings, date, reset]);

  async function onSubmit(values: CashOpeningFormValues) {
    try {
      await upsertOpening.mutateAsync({ date, openingCash: values.openingCash, branchId });
      toast({
        title: existing ? "Opening cash updated" : "Opening cash saved",
        variant: "success",
      });
      onDone?.();
    } catch {
      toast({ title: "Couldn't save opening cash", variant: "error" });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-sm font-medium text-ink">Today's opening cash</p>
        <p className="mt-0.5 text-xs text-ink-faint">
          {existing
            ? "Already recorded — you can adjust the amount."
            : "Prefilled from settings — adjust as needed."}
        </p>
      </div>
      <div>
        <Label htmlFor="openingCash">Opening cash (₱)</Label>
        <Input id="openingCash" type="number" step="0.01" min="0" {...register("openingCash")} />
        {errors.openingCash && <p className="mt-1 text-xs text-danger">{errors.openingCash.message}</p>}
      </div>
      {existing && (
        <p className="flex items-center gap-1.5 text-xs text-success">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Recorded on {formatCurrency(existing.openingCash)}. Saving updates it.
        </p>
      )}
      <Button type="submit" className="w-full" size="lg" disabled={upsertOpening.isPending}>
        {upsertOpening.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {upsertOpening.isPending ? "Saving..." : existing ? "Update opening cash" : "Save opening cash"}
      </Button>
    </form>
  );
}
