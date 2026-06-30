import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"
import type { EmployeeFormSchemaOutput } from "@/utils/validators"
import { employeesKeys } from "@/features/employee/hooks/useEmployees"

async function insertEmployee(values: EmployeeFormSchemaOutput) {
  const { data, error } = await supabase
    .from("employees")
    .insert({
      name: values.name,
      phone: values.phone || null,
      hourly_rate: values.hourly_rate,
      hire_date: values.hire_date,
      is_active: values.is_active,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export function useAddEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: insertEmployee,
    onSuccess: () => {
      toast.success("Employee added")
      queryClient.invalidateQueries({ queryKey: employeesKeys.all })
      queryClient.invalidateQueries({ queryKey: employeesKeys.active })
    },
    onError: (error: Error) => {
      toast.error("Couldn't add employee", { description: error.message })
    },
  })
}