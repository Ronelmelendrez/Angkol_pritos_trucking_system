import { Card, CardContent } from "@/components/ui/card"
import { formatPHP } from "@/utils/currency"
import type { Expense } from "@/types"

interface DailyExpenseSummaryProps {
  expenses: Expense[]
}

export function DailyExpenseSummary({ expenses }: DailyExpenseSummaryProps) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0)
  const todayStr = new Date().toISOString().slice(0, 10)
  const todayTotal = expenses
    .filter((e) => e.expense_date === todayStr)
    .reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      <Card>
        <CardContent className="py-4">
          <p className="text-xs font-medium text-muted-foreground">Today's expenses</p>
          <p className="mt-1 font-figures text-2xl font-bold text-annatto-500">
            {formatPHP(todayTotal)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="py-4">
          <p className="text-xs font-medium text-muted-foreground">Filtered total</p>
          <p className="mt-1 font-figures text-2xl font-bold text-char-900">
            {formatPHP(total)}
          </p>
        </CardContent>
      </Card>
      <Card className="hidden md:block">
        <CardContent className="py-4">
          <p className="text-xs font-medium text-muted-foreground">Entries shown</p>
          <p className="mt-1 font-figures text-2xl font-bold text-char-900">
            {expenses.length}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}