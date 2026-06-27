import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { repaymentSchema, type RepaymentFormSchemaOutput } from "@/utils/validators"
import { todayISO } from "@/utils/date"
import { formatPHP } from "@/utils/currency"
import { useRepayLoan } from "@/features/loans/hooks/useRepayLoan"
import type { Loan } from "@/types"

interface RepaymentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  loan?: Loan
}

export function RepaymentForm({ open, onOpenChange, loan }: RepaymentFormProps) {
  const repayLoan = useRepayLoan()

  const form = useForm({
    resolver: zodResolver(repaymentSchema),
    defaultValues: { amount: 0, repayment_date: todayISO(), notes: "" },
  })

  function onSubmit(values: RepaymentFormSchemaOutput) {
    if (!loan) return
    repayLoan.mutate(
      { loanId: loan.id, values },
      {
        onSuccess: () => {
          onOpenChange(false)
          form.reset({ amount: 0, repayment_date: todayISO(), notes: "" })
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record repayment</DialogTitle>
          {loan && (
            <DialogDescription>
              {loan.employee?.name} · Remaining balance: {formatPHP(loan.remaining_balance)}
            </DialogDescription>
          )}
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₱)</FormLabel>
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
                name="repayment_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g. deducted from payroll" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={repayLoan.isPending}>
                {repayLoan.isPending && <Loader2 className="size-4 animate-spin" />}
                Record repayment
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}