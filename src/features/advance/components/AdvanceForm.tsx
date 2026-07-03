import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { advanceSchema, type AdvanceFormValues } from "@/utils/validators";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { useAddAdvance } from "../hooks/useAdvances";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import { useToast } from "@/components/ui/use-toast";
import { todayISO } from "@/utils/date";

export function AdvanceForm({ onDone }: { onDone?: () => void }) {
  const { toast } = useToast();
  const addAdvance = useAddAdvance();
  const { data: employees = [] } = useEmployees();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AdvanceFormValues>({
    resolver: zodResolver(advanceSchema),
    defaultValues: { employeeId: "", amount: 0, date: todayISO(), reason: "" },
  });

  async function onSubmit(values: AdvanceFormValues) {
    try {
      await addAdvance.mutateAsync(values);
      toast({ title: "Cash advance recorded", variant: "success" });
      reset({ employeeId: "", amount: 0, date: todayISO(), reason: "" });
      onDone?.();
    } catch {
      toast({ title: "Couldn't save advance", variant: "error" });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="employeeId">Employee</Label>
        <Controller
          control={control}
          name="employeeId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="employeeId">
                <SelectValue placeholder="Choose employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.employeeId && <p className="mt-1 text-xs text-danger">{errors.employeeId.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Amount (₱)</Label>
          <Input id="amount" type="number" step="0.01" min="0" {...register("amount")} />
          {errors.amount && <p className="mt-1 text-xs text-danger">{errors.amount.message}</p>}
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" {...register("date")} />
        </div>
      </div>
      <div>
        <Label htmlFor="reason">Reason (optional)</Label>
        <Input id="reason" placeholder="e.g. Emergency, fare, supplies" {...register("reason")} />
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={addAdvance.isPending}>
        {addAdvance.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {addAdvance.isPending ? "Saving..." : "Record advance"}
      </Button>
    </form>
  );
}