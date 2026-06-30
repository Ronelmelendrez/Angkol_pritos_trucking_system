import { useState } from "react"
import { Clock, LogIn, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorBoundary } from "@/components/layout/ErrorBoundary"

function AttendanceContent() {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-display text-lg font-semibold text-char-900 md:text-xl">
        Attendance
      </h2>

      {/* Large mobile-friendly clock in/out button */}
      <Card className="shadow-ticket">
        <CardContent className="flex flex-col items-center gap-4 py-8">
          <div className="flex size-24 items-center justify-center rounded-full bg-ember-100 text-ember-600">
            <Clock className="size-12" />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Tap to clock in for your shift
          </p>
          <Button size="lg" className="w-full max-w-xs gap-2 py-6 text-base sm:w-auto">
            <LogIn className="size-5" />
            Clock In
          </Button>
        </CardContent>
      </Card>

      {/* Today's attendance list */}
      <Card className="shadow-ticket">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Who's clocked in today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-4 text-center text-sm text-muted-foreground">
            No employees clocked in yet today.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export function AttendancePage() {
  return (
    <ErrorBoundary section="Attendance">
      <AttendanceContent />
    </ErrorBoundary>
  )
}