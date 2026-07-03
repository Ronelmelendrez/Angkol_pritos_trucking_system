import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAdvances } from "@/features/advances/hooks/useAdvances";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import { AdvanceForm } from "@/features/advances/components/AdvanceForm";
import { AdvancesList } from "@/features/advances/components/AdvancesList";

export function AdvancesPage() {
  const { data: advances = [], isLoading } = useAdvances();
  const { data: employees = [] } = useEmployees();
  const [dialogOpen, setDialogOpen] = useState(false);

  const pendingTotal = advances.filter((a) => a.status === "pending").reduce((s, a) => s + a.amount, 0);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Cash advances</CardTitle>
          <CardDescription>
            {advances.length} on record · ₱{pendingTotal.toLocaleString()} pending deduction
          </CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" /> New advance
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record cash advance</DialogTitle>
            </DialogHeader>
            <AdvanceForm onDone={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </CardHeader>

      <AdvancesList advances={advances} employees={employees} isLoading={isLoading} />
    </Card>
  );
}