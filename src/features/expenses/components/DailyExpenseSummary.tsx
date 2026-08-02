import { Card, CardContent } from "@/components/ui/Card"
import { formatCurrency } from "@/utils/currency"
import { todayISO } from "@/utils/date"
import type { Expense } from "@/features/expenses/types"

interface DailyExpenseSummaryProps {
  expenses: Expense[]
}

export function DailyExpenseSummary({ expenses }: DailyExpenseSummaryProps) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0)
  const todayStr = todayISO();
  const todayTotal = expenses
    .filter((e) => e.date === todayStr)
    .reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      <Card>
        <CardContent className="py-4">
          <p className="text-xs font-medium text-ink-faint">Today's expenses</p>
          <p className="mt-1 stamp text-2xl font-semibold text-ink">
            {formatCurrency(todayTotal)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="py-4">
          <p className="text-xs font-medium text-ink-faint">Filtered total</p>
          <p className="mt-1 stamp text-2xl font-semibold text-ink">
            {formatCurrency(total)}
          </p>
        </CardContent>
      </Card>
      <Card className="hidden md:block">
        <CardContent className="py-4">
          <p className="text-xs font-medium text-ink-faint">Entries shown</p>
          <p className="mt-1 stamp text-2xl font-semibold text-ink">
            {expenses.length}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}