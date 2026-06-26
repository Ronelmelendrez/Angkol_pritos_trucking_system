import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { employeeSchema, type EmployeeFormSchema, type EmployeeFormSchemaOutput } from "@/utils/validators"
import { todayISO } from "@/utils/date"
import { useAddEmployee } from "@/features/employees/hooks/useAddEmployee"
import { useUpdateEmployee } from "@/features/employees/hooks/useUpdateEmployee"
import type { Employee } from "@/types"

interface EmployeeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee?: Employee
}

const emptyDefaults: EmployeeFormSchema = {
  name: "",
  phone: "",
  hourly_rate: 0,
  hire_date: todayISO(),
  is_active: true,
}

export function EmployeeForm({ open, onOpenChange, employee }: EmployeeFormProps) {
  const isEditing = Boolean(employee)
  const addEmployee = useAddEmployee()
  const updateEmployee = useUpdateEmployee()
  const isSubmitting = addEmployee.isPending || updateEmployee.isPending

  const form = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: emptyDefaults,
  })

  useEffect(() => {
    if (open) {
      form.reset(
        employee
          ? {
              name: employee.name,
              phone: employee.phone ?? "",
              hourly_rate: employee.hourly_rate,
              hire_date: employee.hire_date,
              is_active: employee.is_active,
            }
          : emptyDefaults
      )
    }
  }, [open, employee, form])

  function onSubmit(values: EmployeeFormSchemaOutput) {
    if (isEditing && employee) {
      updateEmployee.mutate(
        { id: employee.id, values },
        { onSuccess: () => onOpenChange(false) }
      )
    } else {
      addEmployee.mutate(values, { onSuccess: () => onOpenChange(false) })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit employee" : "Add employee"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Rico Cabigon" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="09XX XXX XXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="hourly_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hourly rate (₱)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        inputMode="decimal"
                        {...field}
                        value={field.value as number | string}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hire_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hire date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-md border border-border p-3">
                  <div>
                    <FormLabel>Active</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Inactive employees won't appear in clock-in or advance pickers.
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="mt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {isEditing ? "Save changes" : "Add employee"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}