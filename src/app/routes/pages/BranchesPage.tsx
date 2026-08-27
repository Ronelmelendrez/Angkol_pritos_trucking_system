import { useState } from "react";
import { Package } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/AlertDialog";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { useBranches, useDeleteBranch } from "@/features/branches/hooks/useBranches";
import { useBranchEmployeeCount } from "@/features/employees/hooks/useEmployees";
import { BranchForm } from "@/features/branches/components/BranchForm";
import { BranchList } from "@/features/branches/components/BranchList";
import { useToast } from "@/components/ui/useToast";
import type { Branch } from "@/features/branches/types";

export function BranchesPage() {
  const { data: branches = [], isLoading } = useBranches();
  const deleteBranch = useDeleteBranch();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);
  const { data: employeeCount = 0 } = useBranchEmployeeCount(deleteTarget?.id ?? null);

  function openAdd() {
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(branch: Branch) {
    setEditing(branch);
    setDialogOpen(true);
  }

  function handleDone(result?: { credentials?: { email: string; password: string } }) {
    // Always close dialog - BranchForm handles showing credentials internally
    // and calls onDone again when user clicks "Done" on credentials screen
    setDialogOpen(false);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;

    if (employeeCount > 0) {
      toast({
        title: "Can't remove branch",
        description: `${deleteTarget.name} still has ${employeeCount} ${employeeCount === 1 ? "employee" : "employees"}. Remove or transfer them first.`,
        variant: "error",
      });
      setDeleteTarget(null);
      return;
    }

    try {
      await deleteBranch.mutateAsync(deleteTarget.id);
      toast({ title: "Branch removed", description: deleteTarget.name, variant: "success" });
    } catch (err) {
      console.error("Delete branch error:", err);
      toast({ title: "Couldn't remove branch", variant: "error" });
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Branches</CardTitle>
          <CardDescription>{branches.length} branch{branches.length !== 1 ? "es" : ""} on file</CardDescription>
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
              <Package className="h-4 w-4" /> Add branch
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit branch" : "Add branch"}</DialogTitle>
            </DialogHeader>
            <BranchForm branch={editing} onDone={handleDone} />
          </DialogContent>
        </Dialog>
      </CardHeader>

      <BranchList branches={branches} isLoading={isLoading} onEdit={openEdit} onDelete={setDeleteTarget} />

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove branch</AlertDialogTitle>
            <AlertDialogDescription>
              Remove <span className="font-medium text-ink">{deleteTarget?.name}</span>? This action cannot be undone.
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