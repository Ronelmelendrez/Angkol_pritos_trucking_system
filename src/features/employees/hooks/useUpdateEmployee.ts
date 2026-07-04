import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"
import type { EmployeeFormSchemaOutput } from "@/utils/validators"
import { employeesKeys } from "@/features/employees/hooks/useEmployees"

interface UpdateEmployeeInput {
  id: string
  values: EmployeeFormSchemaOutput
}

async function updateEmployee({ id, values }: UpdateEmployeeInput) {
  const { data, error } = await supabase
    .from("employees")
    .update({
      name: values.name,
      phone: values.phone || null,
      hourly_rate: values.hourly_rate,
      hire_date: values.hire_date,
      is_active: values.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateEmployee,
    onSuccess: () => {
      toast.success("Employee updated")
      queryClient.invalidateQueries({ queryKey: employeesKeys.all })
      queryClient.invalidateQueries({ queryKey: employeesKeys.active })
    },
    onError: (error: Error) => {
      toast.error("Couldn't update employee", { description: error.message })
    },
  })
}