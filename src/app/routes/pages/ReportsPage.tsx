import { ErrorBoundary } from "@/components/layout/ErrorBoundary"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function ReportsContent() {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-display text-lg font-semibold text-char-900 md:text-xl">
        Reports
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-ticket">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Expense Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            No data to display yet.
          </CardContent>
        </Card>

        <Card className="shadow-ticket">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Daily Profit / Loss
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            No data to display yet.
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-ticket">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Payroll Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          No payroll data yet.
        </CardContent>
      </Card>
    </div>
  )
}

export function ReportsPage() {
  return (
    <ErrorBoundary section="Reports">
      <ReportsContent />
    </ErrorBoundary>
  )
}