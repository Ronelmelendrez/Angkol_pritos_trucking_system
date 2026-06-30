import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/Skeleton"
import { ErrorBoundary } from "@/components/layout/ErrorBoundary"
import { DailyExpenseSummary, useExpenses } from "@/features/expenses"
import {
  TrendingUp,
  TrendingDown,
  Receipt,
  Clock,
  Users,
  AlertCircle,
} from "lucide-react"
import { formatPHP } from "@/utils/currency"
import { useEmployees } from "@/features/employee/hooks/useEmployees"
import type { ReactNode } from "react"
import type { Expense } from "@/types"

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ")
}

function StatCard({
  icon,
  label,
  value,
  trend = "neutral",
  loading = false,
}: {
  icon: ReactNode
  label: string
  value: string
  trend?: "up" | "down" | "neutral"
  loading?: boolean
}) {
  const trendColors: Record<string, string> = {
    up: "text-success-500",
    down: "text-annatto-500",
    neutral: "text-char-500",
  }

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : null

  return (
    <Card className="shadow-ticket">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-figures text-char-900">
              {value}
            </span>
            {TrendIcon && (
              <TrendIcon className={cn("size-4", trendColors[trend])} />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function DashboardContent() {
  const today = new Date().toISOString().slice(0, 10)
  const { data: expenses = [], isLoading: expLoading } = useExpenses({
    startDate: today,
    endDate: today,
  })
  const { data: employees = [], isLoading: empLoading } = useEmployees()

  const todayTotal = expenses.reduce((sum: number, e: Expense) => sum + Number(e.amount), 0)
  const activeEmployees = employees.filter((e) => e.is_active).length

  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-display text-lg font-semibold text-char-900 md:text-xl">
        Today's Overview
      </h2>

      {/* Stat cards - 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <StatCard
          icon={<Receipt className="size-4" />}
          label="Today's Expenses"
          value={formatPHP(todayTotal)}
          trend="up"
          loading={expLoading}
        />
        <StatCard
          icon={<TrendingUp className="size-4" />}
          label="Today's Sales"
          value={formatPHP(0)}
          loading={false}
        />
        <StatCard
          icon={<Users className="size-4" />}
          label="Active Employees"
          value={String(activeEmployees)}
          loading={empLoading}
        />
        <StatCard
          icon={<Clock className="size-4" />}
          label="Clocked In"
          value="--"
        />
      </div>

      {/* Daily expense summary */}
      <Card className="shadow-ticket">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Daily Expense Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DailyExpenseSummary expenses={expenses} />
        </CardContent>
      </Card>

      {/* Recent expenses - mobile: list, desktop: table */}
      <Card className="shadow-ticket">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : expenses.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <AlertCircle className="size-8" />
              <p className="text-sm">No expenses recorded today</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {expenses.slice(0, 5).map((expense: Expense) => (
                <li
                  key={expense.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-char-900">
                      {expense.description ?? expense.category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {expense.category}
                    </span>
                  </div>
                  <span className="font-figures font-semibold text-char-900">
                    {formatPHP(expense.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function DashboardPage() {
  return (
    <ErrorBoundary section="Dashboard">
      <DashboardContent />
    </ErrorBoundary>
  )
}