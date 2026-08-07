import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { WithdrawalForm } from "@/features/withdrawals/components/WithdrawalForm";
import { WithdrawalsList } from "@/features/withdrawals/components/WithdrawalsList";
import { useOwnerWithdrawals } from "@/features/withdrawals/hooks/useWithdrawals";
import { formatCurrency } from "@/utils/currency";

export function WithdrawalsPage() {
  const { data: withdrawals = [], isLoading } = useOwnerWithdrawals();
  const [dialogOpen, setDialogOpen] = useState(false);

  const total = withdrawals.reduce((s, w) => s + w.amount, 0);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Owner withdrawals</CardTitle>
          <CardDescription>
            {withdrawals.length} on record · {formatCurrency(total)} taken by the owner
          </CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" /> New withdrawal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record owner withdrawal</DialogTitle>
            </DialogHeader>
            <WithdrawalForm onDone={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </CardHeader>

      <WithdrawalsList withdrawals={withdrawals} isLoading={isLoading} />
    </Card>
  );
}
