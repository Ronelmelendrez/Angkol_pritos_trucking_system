import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { usePayRuleSettings, useUpdatePayRuleSettings } from "../hooks/usePayRuleSettings";
import { useToast } from "@/components/ui/useToast";

const payRuleSettingsSchema = z.object({
  standardHoursPerDay: z.coerce.number().min(1).max(24),
  halfDayThresholdHours: z.coerce.number().min(0),
  halfDayRateMultiplier: z.coerce.number().min(0).max(1),
  overtimeRateMultiplier: z.coerce.number().min(1),
  lateGraceMinutes: z.coerce.number().min(0),
  lateDeductionPerMinute: z.coerce.number().min(0),
  absenceDeductionMode: z.enum(["full_day", "none"]),
  restDayRateMultiplier: z.coerce.number().min(1),
  holidayRateMultiplier: z.coerce.number().min(1),
  nightDifferentialPercent: z.coerce.number().min(0).max(100),
  roundHoursTo: z.union([z.literal(0), z.literal(0.25), z.literal(0.5)]),
}).refine(
  (v) => v.halfDayThresholdHours < v.standardHoursPerDay,
  { message: "Half-day threshold must be less than standard hours", path: ["halfDayThresholdHours"] },
);

type FormValues = z.infer<typeof payRuleSettingsSchema>;

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
      standardHoursPerDay: settings.standardHoursPerDay,
      halfDayThresholdHours: settings.halfDayThresholdHours,
      halfDayRateMultiplier: settings.halfDayRateMultiplier,
      overtimeRateMultiplier: settings.overtimeRateMultiplier,
      lateGraceMinutes: settings.lateGraceMinutes,
      lateDeductionPerMinute: settings.lateDeductionPerMinute,
      absenceDeductionMode: settings.absenceDeductionMode,
      restDayRateMultiplier: settings.restDayRateMultiplier,
      holidayRateMultiplier: settings.holidayRateMultiplier,
      nightDifferentialPercent: settings.nightDifferentialPercent,
      roundHoursTo: settings.roundHoursTo,
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await updateSettings.mutateAsync(values);
      toast({ title: "Pay rules saved", description: "Defaults updated for all employees.", variant: "success" });
    } catch {
      toast({ title: "Couldn't save pay rules", variant: "error" });
    }
  }

  if (isLoading) return <div className="p-6 text-sm text-ink-faint">Loading settings...</div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
        <CardHeader><CardTitle>Half-day &amp; overtime</CardTitle></CardHeader>
        <div className="grid grid-cols-3 gap-4 p-6 pt-0">
          <div>
            <Label htmlFor="halfDayThresholdHours">Half-day threshold (hrs)</Label>
            <Input id="halfDayThresholdHours" type="number" step="0.5" min="0" {...register("halfDayThresholdHours")} />
            {errors.halfDayThresholdHours && <p className="mt-1 text-xs text-danger">{errors.halfDayThresholdHours.message}</p>}
          </div>
          <div>
            <Label htmlFor="halfDayRateMultiplier">Half-day rate multiplier</Label>
            <Input id="halfDayRateMultiplier" type="number" step="0.05" min="0" max="1" {...register("halfDayRateMultiplier")} />
          </div>
          <div>
            <Label htmlFor="overtimeRateMultiplier">Overtime multiplier</Label>
            <Input id="overtimeRateMultiplier" type="number" step="0.05" min="1" {...register("overtimeRateMultiplier")} />
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

      <Button type="submit" className="w-full" size="lg" disabled={updateSettings.isPending}>
        {updateSettings.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        <Save className="h-4 w-4" />
        {updateSettings.isPending ? "Saving..." : "Save pay rules"}
      </Button>
    </form>
  );
}
