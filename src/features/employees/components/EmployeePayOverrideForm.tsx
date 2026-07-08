import { useForm } from "react-hook-form";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { usePayRuleSettings, useEmployeePayOverride, useSetEmployeePayOverride } from "@/features/settings/hooks/usePayRuleSettings";
import { useToast } from "@/components/ui/useToast";
import type { Employee } from "../types";

interface Props {
  employee: Employee;
}

export function EmployeePayOverrideForm({ employee }: Props) {
  const { data: global } = usePayRuleSettings();
  const { data: override } = useEmployeePayOverride(employee.id);
  const setOverride = useSetEmployeePayOverride();
  const { toast } = useToast();

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      halfDayRateMultiplier: override?.halfDayRateMultiplier ?? "",
      overtimeRateMultiplier: override?.overtimeRateMultiplier ?? "",
      lateDeductionPerMinute: override?.lateDeductionPerMinute ?? "",
    },
    values: {
      halfDayRateMultiplier: override?.halfDayRateMultiplier ?? "",
      overtimeRateMultiplier: override?.overtimeRateMultiplier ?? "",
      lateDeductionPerMinute: override?.lateDeductionPerMinute ?? "",
    },
  });

  async function onSubmit(values: { halfDayRateMultiplier: string | number; overtimeRateMultiplier: string | number; lateDeductionPerMinute: string | number }) {
    const payload: Record<string, number> = {};
    if (values.halfDayRateMultiplier !== "") payload.halfDayRateMultiplier = Number(values.halfDayRateMultiplier);
    if (values.overtimeRateMultiplier !== "") payload.overtimeRateMultiplier = Number(values.overtimeRateMultiplier);
    if (values.lateDeductionPerMinute !== "") payload.lateDeductionPerMinute = Number(values.lateDeductionPerMinute);

    try {
      await setOverride.mutateAsync({ employeeId: employee.id, ...payload });
      toast({ title: "Override saved", description: employee.name, variant: "success" });
    } catch {
      toast({ title: "Couldn't save override", variant: "error" });
    }
  }

  function handleReset() {
    reset({ halfDayRateMultiplier: "", overtimeRateMultiplier: "", lateDeductionPerMinute: "" });
    setOverride.mutate(
      { employeeId: employee.id },
      { onSuccess: () => toast({ title: "Overrides cleared", description: "Using global defaults.", variant: "success" }) },
    );
  }

  if (!global) return <div className="p-4 text-sm text-ink-faint">Loading global defaults...</div>;

  const hasOverride = override != null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-xs text-ink-faint">
        Leave blank to use the global default shown in parentheses.
      </p>

      <div>
        <Label htmlFor="halfDayRateMultiplier">
          Half-day multiplier <span className="text-ink-faint">(global: {global.halfDayRateMultiplier}×)</span>
        </Label>
        <Input id="halfDayRateMultiplier" type="number" step="0.05" min="0" max="1" placeholder={String(global.halfDayRateMultiplier)} {...register("halfDayRateMultiplier")} />
        {hasOverride && override?.halfDayRateMultiplier != null && (
          <p className="mt-0.5 text-xs text-primary-dark">Overriding default {global.halfDayRateMultiplier}× → {override.halfDayRateMultiplier}×</p>
        )}
      </div>

      <div>
        <Label htmlFor="overtimeRateMultiplier">
          Overtime multiplier <span className="text-ink-faint">(global: {global.overtimeRateMultiplier}×)</span>
        </Label>
        <Input id="overtimeRateMultiplier" type="number" step="0.05" min="1" placeholder={String(global.overtimeRateMultiplier)} {...register("overtimeRateMultiplier")} />
        {hasOverride && override?.overtimeRateMultiplier != null && (
          <p className="mt-0.5 text-xs text-primary-dark">Overriding default {global.overtimeRateMultiplier}× → {override.overtimeRateMultiplier}×</p>
        )}
      </div>

      <div>
        <Label htmlFor="lateDeductionPerMinute">
          Late deduction per min (₱) <span className="text-ink-faint">(global: ₱{global.lateDeductionPerMinute})</span>
        </Label>
        <Input id="lateDeductionPerMinute" type="number" step="0.5" min="0" placeholder={String(global.lateDeductionPerMinute)} {...register("lateDeductionPerMinute")} />
        {hasOverride && override?.lateDeductionPerMinute != null && (
          <p className="mt-0.5 text-xs text-primary-dark">Overriding default ₱{global.lateDeductionPerMinute} → ₱{override.lateDeductionPerMinute}</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="touch" disabled={setOverride.isPending}>
          {setOverride.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          <Save className="h-4 w-4" /> Save overrides
        </Button>
        {hasOverride && (
          <Button type="button" variant="outline" size="touch" onClick={handleReset}>
            Clear overrides
          </Button>
        )}
      </div>
    </form>
  );
}
