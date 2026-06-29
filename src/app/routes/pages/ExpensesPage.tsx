import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ErrorBoundary } from "@/components/layout/ErrorBoundary"
import {
  ExpenseForm,
  ExpenseList,
  ExpenseFilters,
  DailyExpenseSummary,
  useExpenses,
} from "@/features/expenses"
import type { ExpenseFiltersType } from "@/features/expenses"

function ExpensesPageContent() {
  const [filters, setFilters] = useState<ExpenseFiltersType>({})
  const [formOpen, setFormOpen] = useState(false)
  const { data: expenses = [], isLoading } = useExpenses(filters)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ExpenseFilters filters={filters} onChange={setFilters} />
        <Button onClick={() => setFormOpen(true)} className="gap-1.5">
          <Plus className="size-4" />
          Add expense
        </Button>
      </div>

      <DailyExpenseSummary expenses={expenses} />

      <ExpenseList expenses={expenses} isLoading={isLoading} />

      <ExpenseForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}

export default function ExpensesPage() {
  return (
    <ErrorBoundary section="Expenses">
      <ExpensesPageContent />
    </ErrorBoundary>
  )
}