import { useForm, Controller, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { usePayRuleSettings, useUpdatePayRuleSettings } from "../hooks/usePayRuleSettings";
import { useToast } from "@/components/ui/useToast";
import type { PaydayRule } from "../types";

const payRuleSettingsSchema = z.object({
  defaultReorderThreshold: z.coerce.number().min(0),
  standardHoursPerDay: z.coerce.number().min(1).max(24),
  halfDayThresholdHours: z.coerce.number().min(0),
  halfDayRateMultiplier: z.coerce.number().min(0).max(1),
  lateGraceMinutes: z.coerce.number().min(0),
  lateDeductionPerMinute: z.coerce.number().min(0),
  absenceDeductionMode: z.enum(["full_day", "none"]),
  restDayRateMultiplier: z.coerce.number().min(1),
  holidayRateMultiplier: z.coerce.number().min(1),
  nightDifferentialPercent: z.coerce.number().min(0).max(100),
  roundHoursTo: z.union([z.literal(0), z.literal(0.25), z.literal(0.5)]),
  paydayRules: z.array(z.object({
    frequency: z.enum(["weekly", "semi_monthly", "monthly"]),
    offsetDays: z.coerce.number().min(0),
    weekendAdjustment: z.enum(["none", "move_earlier", "move_later"]),
    fixedWeekday: z.union([z.literal(""), z.coerce.number().min(0).max(6)]),
  })),
}).refine(
  (v) => v.halfDayThresholdHours < v.standardHoursPerDay,
  { message: "Half-day threshold must be less than standard hours", path: ["halfDayThresholdHours"] },
);

type FormValues = z.infer<typeof payRuleSettingsSchema>;

const FREQ_LABELS: Record<string, string> = {
  weekly: "Weekly",
  semi_monthly: "Semi-monthly",
  monthly: "Monthly",
};

const WEEKDAY_OPTIONS = [
  { value: "", label: "Not set (use offset)" },
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

export function PayRuleSettingsForm() {
  const { data: settings, isLoading } = usePayRuleSettings();
  const updateSettings = useUpdatePayRuleSettings();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(payRuleSettingsSchema) as unknown as Resolver<FormValues>,
    values: settings && {
      defaultReorderThreshold: settings.defaultReorderThreshold,
      standardHoursPerDay: settings.standardHoursPerDay,
      halfDayThresholdHours: settings.halfDayThresholdHours,
      halfDayRateMultiplier: settings.halfDayRateMultiplier,
      lateGraceMinutes: settings.lateGraceMinutes,
      lateDeductionPerMinute: settings.lateDeductionPerMinute,
      absenceDeductionMode: settings.absenceDeductionMode,
      restDayRateMultiplier: settings.restDayRateMultiplier,
      holidayRateMultiplier: settings.holidayRateMultiplier,
      nightDifferentialPercent: settings.nightDifferentialPercent,
      roundHoursTo: settings.roundHoursTo,
      paydayRules: settings.paydayRules.map((r) => ({
        frequency: r.frequency,
        offsetDays: r.offsetDays,
        weekendAdjustment: r.weekendAdjustment,
        fixedWeekday: r.fixedWeekday != null ? r.fixedWeekday : "",
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "paydayRules" });

  const usedFrequencies = new Set(fields.map((f) => f.frequency));
  const availableFrequencies = (["weekly", "semi_monthly", "monthly"] as const).filter((f) => !usedFrequencies.has(f));

  async function onSubmit(values: FormValues) {
    const paydayRules: PaydayRule[] = values.paydayRules.map((r) => ({
      frequency: r.frequency,
      offsetDays: r.offsetDays,
      weekendAdjustment: r.weekendAdjustment,
      ...(r.fixedWeekday !== "" ? { fixedWeekday: Number(r.fixedWeekday) as 0 | 1 | 2 | 3 | 4 | 5 | 6 } : {}),
    }));
    try {
      await updateSettings.mutateAsync({ ...values, paydayRules });
      toast({ title: "Pay rules saved", description: "Defaults updated for all employees.", variant: "success" });
    } catch {
      toast({ title: "Couldn't save pay rules", variant: "error" });
    }
  }

  if (isLoading) return <div className="p-6 text-sm text-ink-faint">Loading settings...</div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Inventory defaults</CardTitle></CardHeader>
        <div className="p-6 pt-0">
          <div>
            <Label htmlFor="defaultReorderThreshold">Default reorder threshold</Label>
            <Input id="defaultReorderThreshold" type="number" min="0" {...register("defaultReorderThreshold")} />
            {errors.defaultReorderThreshold && <p className="mt-1 text-xs text-danger">{errors.defaultReorderThreshold.message}</p>}
            <p className="mt-1 text-xs text-ink-faint">Low-stock alert triggers when stock drops below this. Override per product.</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Working hours</CardTitle></CardHeader>
        <div className="grid grid-cols-2 gap-4 p-6 pt-0">
          <div>
            <Label htmlFor="standardHoursPerDay">Standard hours per day</Label>
            <Input id="standardHoursPerDay" type="number" step="0.5" min="1" max="24" {...register("standardHoursPerDay")} />
            {errors.standardHoursPerDay && <p className="mt-1 text-xs text-danger">{errors.standardHoursPerDay.message}</p>}
          </div>
          <div>
            <Label htmlFor="roundHoursTo">Round hours to</Label>
            <Controller
              control={control}
              name="roundHoursTo"
              render={({ field }) => (
                <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                  <SelectTrigger id="roundHoursTo"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Nearest hour</SelectItem>
                    <SelectItem value="0.25">Nearest quarter-hour</SelectItem>
                    <SelectItem value="0.5">Nearest half-hour</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Half-day rate</CardTitle></CardHeader>
        <div className="grid grid-cols-2 gap-4 p-6 pt-0">
          <div>
            <Label htmlFor="halfDayThresholdHours">Half-day threshold (hrs)</Label>
            <Input id="halfDayThresholdHours" type="number" step="0.5" min="0" {...register("halfDayThresholdHours")} />
            {errors.halfDayThresholdHours && <p className="mt-1 text-xs text-danger">{errors.halfDayThresholdHours.message}</p>}
          </div>
          <div>
            <Label htmlFor="halfDayRateMultiplier">Half-day rate multiplier</Label>
            <Input id="halfDayRateMultiplier" type="number" step="0.05" min="0" max="1" {...register("halfDayRateMultiplier")} />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Lateness</CardTitle></CardHeader>
        <div className="grid grid-cols-2 gap-4 p-6 pt-0">
          <div>
            <Label htmlFor="lateGraceMinutes">Grace period (minutes)</Label>
            <Input id="lateGraceMinutes" type="number" min="0" {...register("lateGraceMinutes")} />
          </div>
          <div>
            <Label htmlFor="lateDeductionPerMinute">Deduction per late minute (₱)</Label>
            <Input id="lateDeductionPerMinute" type="number" step="0.5" min="0" {...register("lateDeductionPerMinute")} />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Special days</CardTitle></CardHeader>
        <div className="grid grid-cols-3 gap-4 p-6 pt-0">
          <div>
            <Label htmlFor="restDayRateMultiplier">Rest day multiplier</Label>
            <Input id="restDayRateMultiplier" type="number" step="0.05" min="1" {...register("restDayRateMultiplier")} />
          </div>
          <div>
            <Label htmlFor="holidayRateMultiplier">Holiday multiplier</Label>
            <Input id="holidayRateMultiplier" type="number" step="0.05" min="1" {...register("holidayRateMultiplier")} />
          </div>
          <div>
            <Label htmlFor="nightDifferentialPercent">Night differential (%)</Label>
            <Input id="nightDifferentialPercent" type="number" min="0" max="100" {...register("nightDifferentialPercent")} />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payday rules</CardTitle>
          <p className="text-xs text-ink-faint">Configure when each pay frequency is typically paid. This is a suggestion — the actual pay date is set when marking payroll as paid.</p>
        </CardHeader>
        <div className="space-y-3 p-6 pt-0">
          {fields.map((field, index) => (
            <div key={field.id} className="flex flex-wrap items-end gap-3 rounded-lg border border-line p-4">
              <div className="min-w-28 flex-1">
                <Label>Frequency</Label>
                <p className="pt-1 text-sm font-medium text-ink">{FREQ_LABELS[field.frequency]}</p>
              </div>
              <div>
                <Label htmlFor={`paydayRules.${index}.offsetDays`}>Offset (days)</Label>
                <Input id={`paydayRules.${index}.offsetDays`} type="number" min="0" className="w-24" {...register(`paydayRules.${index}.offsetDays`)} />
              </div>
              <div>
                <Label htmlFor={`paydayRules.${index}.fixedWeekday`}>Fixed weekday</Label>
                <Controller
                  control={control}
                  name={`paydayRules.${index}.fixedWeekday`}
                  render={({ field }) => (
                    <Select value={String(field.value)} onValueChange={(v) => field.onChange(v)}>
                      <SelectTrigger id={`paydayRules.${index}.fixedWeekday`} className="w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {WEEKDAY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label htmlFor={`paydayRules.${index}.weekendAdjustment`}>Weekend rule</Label>
                <Controller
                  control={control}
                  name={`paydayRules.${index}.weekendAdjustment`}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id={`paydayRules.${index}.weekendAdjustment`} className="w-36"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No adjustment</SelectItem>
                        <SelectItem value="move_earlier">Move earlier</SelectItem>
                        <SelectItem value="move_later">Move later</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              {fields.length > 1 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {availableFrequencies.length > 0 && (
            <Button type="button" variant="outline" size="sm" onClick={() => append({ frequency: availableFrequencies[0], offsetDays: 5, weekendAdjustment: "move_earlier", fixedWeekday: "" })}>
              <Plus className="h-4 w-4" /> Add {FREQ_LABELS[availableFrequencies[0]]} rule
            </Button>
          )}
        </div>
      </Card>

      <Button type="submit" className="w-full" size="lg" disabled={updateSettings.isPending}>
        {updateSettings.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        <Save className="h-4 w-4" />
        {updateSettings.isPending ? "Saving..." : "Save pay rules"}
      </Button>
    </form>
  );
}
