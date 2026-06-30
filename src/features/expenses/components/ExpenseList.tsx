import { useState } from "react"
import { Pencil, Trash2, Receipt } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/Skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/AlertDialog"
import { ExpenseForm } from "@/features/expenses/components/ExpenseForm"
import { useDeleteExpense } from "@/features/expenses/hooks/useDeleteExpense"
import { formatPHP } from "@/utils/currency"
import { formatDateShort } from "@/utils/date"
import type { Expense } from "@/types"

interface ExpenseListProps {
  expenses: Expense[]
  isLoading: boolean
}

export function ExpenseList({ expenses, isLoading }: ExpenseListProps) {
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>()
  const [deletingId, setDeletingId] = useState<string | undefined>()
  const deleteExpense = useDeleteExpense()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
        <Receipt className="size-8 text-char-300" />
        <p className="text-sm font-medium text-char-700">No expenses recorded yet</p>
        <p className="text-xs text-muted-foreground">
          Tap "Add expense" to record your first one.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Desktop / tablet: table */}
      <div className="hidden rounded-lg border border-border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="text-char-700">
                  {formatDateShort(expense.expense_date)}
                </TableCell>
                <TableCell>
                  <Badge variant="default">{expense.category}</Badge>
                </TableCell>
                <TableCell className="max-w-50 truncate text-char-700">
                  {expense.description || "—"}
                </TableCell>
                <TableCell className="text-char-700">{expense.supplier || "—"}</TableCell>
                <TableCell className="text-char-700">{expense.payment_method}</TableCell>
                <TableCell className="text-right font-figures font-semibold text-char-900">
                  {formatPHP(expense.amount)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => setEditingExpense(expense)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:text-destructive"
                      onClick={() => setDeletingId(expense.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: cards */}
      <div className="flex flex-col gap-2 md:hidden">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="rounded-lg border border-border bg-card p-3.5 shadow-ticket"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-char-900">
                  {expense.description || expense.category}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <Badge variant="default">{expense.category}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDateShort(expense.expense_date)}
                  </span>
                </div>
              </div>
              <p className="shrink-0 font-figures text-base font-bold text-char-900">
                {formatPHP(expense.amount)}
              </p>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
              <p className="text-xs text-muted-foreground">
                {expense.supplier ? `${expense.supplier} · ` : ""}
                {expense.payment_method}
              </p>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => setEditingExpense(expense)}
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-destructive hover:text-destructive"
                  onClick={() => setDeletingId(expense.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ExpenseForm
        open={Boolean(editingExpense)}
        onOpenChange={(open) => !open && setEditingExpense(undefined)}
        expense={editingExpense}
      />

      <AlertDialog open={Boolean(deletingId)} onOpenChange={(open) => !open && setDeletingId(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this expense?</AlertDialogTitle>
            <AlertDialogDescription>
              This can't be undone. The expense will be permanently removed from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingId) deleteExpense.mutate(deletingId)
                setDeletingId(undefined)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}