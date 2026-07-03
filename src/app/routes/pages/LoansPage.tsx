import { Plus } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { ErrorBoundary } from "@/components/layout/ErrorBoundary"
import { Card, CardContent } from "@/components/ui/Card"

function LoansContent() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-char-900 md:text-xl">
          Loans (Utang)
        </h2>
        <Button className="gap-1.5">
          <Plus className="size-4" />
          <span className="hidden sm:inline">New loan</span>
        </Button>
      </div>

      <Card className="shadow-ticket">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          No loans recorded yet.
        </CardContent>
      </Card>
    </div>
  )
}

export function LoansPage() {
  return (
    <ErrorBoundary section="Loans">
      <LoansContent />
    </ErrorBoundary>
  )
}