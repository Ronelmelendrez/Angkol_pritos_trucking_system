import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { useLoans } from "@/features/loans/hooks/useLoans";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import { LoanForm } from "@/features/loans/components/LoanForm";
import { LoansList } from "@/features/loans/components/LoansList";

export function LoansPage() {
  const { data: loans = [], isLoading } = useLoans();
  const { data: employees = [] } = useEmployees();
  const [dialogOpen, setDialogOpen] = useState(false);

  const activeCount = loans.filter((l) => l.status === "active").length;
  const totalOutstanding = loans
    .filter((l) => l.status === "active")
    .reduce((s, l) => s + l.remainingBalance, 0);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Loans (Utang)</CardTitle>
          <CardDescription>
            {activeCount} active · ₱{totalOutstanding.toLocaleString()} outstanding
          </CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" /> New loan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record loan</DialogTitle>
            </DialogHeader>
            <LoanForm onDone={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </CardHeader>

      <LoansList loans={loans} employees={employees} isLoading={isLoading} />
    </Card>
  );
}
