import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ErrorBoundary } from "@/components/layout/ErrorBoundary"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/Skeleton"
import { Badge } from "@/components/ui/Badge"
import { useEmployees } from "@/features/employee/hooks/useEmployees"
import { EmployeeForm } from "@/features/employee/components/Employeeform"
import type { Employee } from "@/types"

function EmployeesContent() {
  const { data: employees = [], isLoading } = useEmployees()
  const [formOpen, setFormOpen] = useState(false)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-char-900 md:text-xl">
          Employees
        </h2>
        <Button onClick={() => setFormOpen(true)} className="gap-1.5">
          <Plus className="size-4" />
          <span className="hidden sm:inline">Add employee</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="shadow-ticket">
              <CardContent className="p-4">
                <Skeleton className="mb-2 h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : employees.length === 0 ? (
        <Card className="shadow-ticket">
          <CardContent className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
            <p className="text-sm">No employees yet. Add your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {employees.map((employee: Employee) => (
            <Card key={employee.id} className="shadow-ticket">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-char-900">
                      {employee.name}
                    </span>
                    {employee.phone && (
                      <span className="text-xs text-muted-foreground">
                        {employee.phone}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      ₱{employee.hourly_rate}/hr &middot; Hired{" "}
                      {new Date(employee.hire_date).toLocaleDateString()}
                    </span>
                  </div>
                  <Badge
                    variant={employee.is_active ? "default" : "secondary"}
                    className="shrink-0"
                  >
                    {employee.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <EmployeeForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}

export function EmployeesPage() {
  return (
    <ErrorBoundary section="Employees">
      <EmployeesContent />
    </ErrorBoundary>
  )
}