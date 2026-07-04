import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"
import type { AdvanceFormSchemaOutput } from "@/utils/validators"
import { advancesKeys } from "@/features/advances/hooks/useAdvances"

async function insertAdvance(values: AdvanceFormSchemaOutput) {
  const { data, error } = await supabase
    .from("cash_advances")
    .insert({
      employee_id: values.employee_id,
      amount: values.amount,
      advance_date: values.advance_date,
      notes: values.notes || null,
      status: "pending",
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export function useAddAdvance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: insertAdvance,
    onSuccess: () => {
      toast.success("Cash advance recorded")
      queryClient.invalidateQueries({ queryKey: advancesKeys.all })
    },
    onError: (error: Error) => {
      toast.error("Couldn't record advance", { description: error.message })
    },
  })
}

async function markDeducted(id: string) {
  const { data, error } = await supabase
    .from("cash_advances")
    .update({ status: "deducted" })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export function useMarkAdvanceDeducted() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markDeducted,
    onSuccess: () => {
      toast.success("Marked as deducted from payroll")
      queryClient.invalidateQueries({ queryKey: advancesKeys.all })
    },
    onError: (error: Error) => {
      toast.error("Couldn't update advance", { description: error.message })
    },
  })
}