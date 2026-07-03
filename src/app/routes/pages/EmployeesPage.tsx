import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { useEmployees, useDeleteEmployee } from "@/features/employees/hooks/useEmployees";
import { EmployeeForm } from "@/features/employees/components/Employeeform";
import { EmployeeList } from "@/features/employees/components/EmployeeList";
import { useToast } from "@/components/ui/use-toast";
import type { Employee } from "@/features/employees/types";

export function EmployeesPage() {
  const { data: employees = [], isLoading } = useEmployees();
  const deleteEmployee = useDeleteEmployee();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | undefined>(undefined);

  function openAdd() {
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(employee: Employee) {
    setEditing(employee);
    setDialogOpen(true);
  }

  async function handleDelete(employee: Employee) {
    if (!confirm(`Remove ${employee.name} from the crew?`)) return;
    try {
      await deleteEmployee.mutateAsync(employee.id);
      toast({ title: "Employee removed", description: employee.name });
    } catch {
      toast({ title: "Couldn't remove employee", variant: "error" });
    }
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Crew directory</CardTitle>
          <CardDescription>{employees.length} employees on file</CardDescription>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditing(undefined);
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4" /> Add employee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit employee" : "Add employee"}</DialogTitle>
            </DialogHeader>
            <EmployeeForm employee={editing} onDone={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </CardHeader>

      <EmployeeList employees={employees} isLoading={isLoading} onEdit={openEdit} onDelete={handleDelete} />
    </Card>
  );
}