import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ErrorBoundary } from "@/components/layout/ErrorBoundary"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function AdvancesContent() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-char-900 md:text-xl">
          Cash Advances
        </h2>
        <Button className="gap-1.5">
          <Plus className="size-4" />
          <span className="hidden sm:inline">New advance</span>
        </Button>
      </div>

      <Card className="shadow-ticket">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          No cash advances recorded yet.
        </CardContent>
      </Card>
    </div>
  )
}

export function AdvancesPage() {
  return (
    <ErrorBoundary section="Advances">
      <AdvancesContent />
    </ErrorBoundary>
  )
}