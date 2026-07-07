import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { employeeSchema, type EmployeeFormValues } from "@/utils/validators";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Checkbox } from "@/components/ui/Checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { useAddEmployee, useUpdateEmployee } from "../hooks/useEmployees";
import { useToast } from "@/components/ui/useToast";
import { todayISO } from "@/utils/date";
import type { Employee } from "../types";

interface Props {
  employee?: Employee;
  onDone?: () => void;
}

export function EmployeeForm({ employee, onDone }: Props) {
  const { toast } = useToast();
  const addEmployee = useAddEmployee();
  const updateEmployee = useUpdateEmployee();
  const isEditing = !!employee;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema) as unknown as Resolver<EmployeeFormValues>,
    defaultValues: {
      name: employee?.name ?? "",
      phone: employee?.phone ?? "",
      hourlyRate: employee?.hourlyRate ?? 60,
      hireDate: employee?.hireDate ?? todayISO(),
      isActive: employee?.isActive ?? true,
      payFrequency: employee?.payFrequency ?? "semi_monthly",
    },
  });

  const isPending = addEmployee.isPending || updateEmployee.isPending;

  async function onSubmit(values: EmployeeFormValues) {
    try {
      if (isEditing) {
        await updateEmployee.mutateAsync({ id: employee.id, ...values });
        toast({ title: "Employee updated", description: values.name, variant: "success" });
      } else {
        await addEmployee.mutateAsync(values);
        toast({ title: "Employee added", description: values.name, variant: "success" });
      }
      onDone?.();
    } catch {
      toast({ title: "Couldn't save employee", variant: "error" });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Full name</Label>
        <Input id="name" placeholder="e.g. Rosa Dimaculangan" {...register("name")} />
        {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
      </div>
      <div>
        <Label htmlFor="phone">Phone number</Label>
        <Input id="phone" placeholder="0917 234 5678" {...register("phone")} />
        {errors.phone && <p className="mt-1 text-xs text-danger">{errors.phone.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="hourlyRate">Hourly rate (₱)</Label>
          <Input id="hourlyRate" type="number" step="0.01" min="0" {...register("hourlyRate")} />
          {errors.hourlyRate && <p className="mt-1 text-xs text-danger">{errors.hourlyRate.message}</p>}
        </div>
        <div>
          <Label htmlFor="hireDate">Hire date</Label>
          <Input id="hireDate" type="date" {...register("hireDate")} />
        </div>
      </div>
      <div>
        <Label htmlFor="payFrequency">Pay frequency</Label>
        <Controller
          control={control}
          name="payFrequency"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="payFrequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semi_monthly">Semi-monthly (1st\u201315th / 16th\u2013end)</SelectItem>
                <SelectItem value="weekly">Weekly (Mon\u2013Sun)</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.payFrequency && <p className="mt-1 text-xs text-danger">{errors.payFrequency.message}</p>}
      </div>
      <Controller
        control={control}
        name="isActive"
        render={({ field }) => (
          <label className="flex cursor-pointer items-center gap-2">
            <Checkbox checked={field.value} onCheckedChange={(v: boolean) => field.onChange(v)} />
            <span className="text-sm text-ink">Currently active on the crew</span>
          </label>
        )}
      />
      <Button type="submit" className="w-full" size="lg" disabled={isPending}>
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {isPending ? "Saving..." : isEditing ? "Save changes" : "Add employee"}
      </Button>
    </form>
  );
}