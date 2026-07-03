import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { loanSchema, type LoanFormValues } from "@/utils/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useAddLoan } from "../hooks/useLoans";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import { useToast } from "@/components/ui/useToast";
import { todayISO } from "@/utils/date";

export function LoanForm({ onDone }: { onDone?: () => void }) {
  const { toast } = useToast();
  const addLoan = useAddLoan();
  const { data: employees = [] } = useEmployees();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<LoanFormValues>({
    resolver: zodResolver(loanSchema),
    defaultValues: { employeeId: "", principal: 0, interestRate: 0, dateIssued: todayISO(), notes: "" },
  });

  async function onSubmit(values: LoanFormValues) {
    try {
      await addLoan.mutateAsync(values);
      toast({ title: "Loan recorded", variant: "success" });
      reset({ employeeId: "", principal: 0, interestRate: 0, dateIssued: todayISO(), notes: "" });
      onDone?.();
    } catch {
      toast({ title: "Couldn't save loan", variant: "error" });
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
          <Label htmlFor="principal">Loan amount (₱)</Label>
          <Input id="principal" type="number" step="0.01" min="0" {...register("principal")} />
          {errors.principal && <p className="mt-1 text-xs text-danger">{errors.principal.message}</p>}
        </div>
        <div>
          <Label htmlFor="interestRate">Interest (%)</Label>
          <Input id="interestRate" type="number" step="0.1" min="0" {...register("interestRate")} />
        </div>
      </div>
      <div>
        <Label htmlFor="dateIssued">Date issued</Label>
        <Input id="dateIssued" type="date" {...register("dateIssued")} />
      </div>
      <div>
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea id="notes" placeholder="e.g. Motorcycle repair" {...register("notes")} />
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={addLoan.isPending}>
        {addLoan.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {addLoan.isPending ? "Saving..." : "Record loan"}
      </Button>
    </form>
  );
}