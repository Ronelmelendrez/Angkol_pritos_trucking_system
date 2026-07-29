import { useState } from "react";
import { Plus } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/AlertDialog";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { useEmployees, useDeleteEmployee } from "@/features/employees/hooks/useEmployees";
import { EmployeeForm } from "@/features/employees/components/Employeeform";
import { EmployeeList } from "@/features/employees/components/EmployeeList";
import { EmployeeDetailModal } from "@/features/employees/components/EmployeeDetailModal";
import { useToast } from "@/components/ui/useToast";
import type { Employee } from "@/features/employees/types";

export function EmployeesPage() {
  const { data: employees = [], isLoading } = useEmployees();
  const deleteEmployee = useDeleteEmployee();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [editing, setEditing] = useState<Employee | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  function openAdd() {
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(employee: Employee) {
    setEditing(employee);
    setDialogOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    try {
      await deleteEmployee.mutateAsync(deleteTarget.id);
      toast({ title: "Employee removed", description: deleteTarget.name });
    } catch (err) {
      console.error("Delete employee error:", err);
      toast({ title: "Couldn't remove employee", variant: "error" });
    } finally {
      setDeleteTarget(null);
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

      <EmployeeList employees={employees} isLoading={isLoading} onSelect={setSelected} onEdit={openEdit} onDelete={setDeleteTarget} />

      <EmployeeDetailModal
        employee={selected}
        open={!!selected}
        onOpenChange={(open) => { if (!open) setSelected(null); }}
        onEdit={openEdit}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove employee</AlertDialogTitle>
            <AlertDialogDescription>
              Remove <span className="font-medium text-ink">{deleteTarget?.name}</span> from the crew? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}