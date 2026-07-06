import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { SalesList } from "@/features/sales/components/SalesList";
import { SaleForm } from "@/features/sales/components/SaleForm";
import { useSales } from "@/features/sales/hooks/useSales";
import { formatCurrency } from "@/utils/currency";

export function SalesPage() {
  const { data: sales = [] } = useSales();
  const [dialogOpen, setDialogOpen] = useState(false);
  const totalSales = sales.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Sales tracking</CardTitle>
            <CardDescription>
              {sales.length} sale{sales.length === 1 ? "" : "s"} · Total{" "}
              <span className="font-semibold text-ink">{formatCurrency(totalSales)}</span>
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" /> Record sale
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log a new sale</DialogTitle>
              </DialogHeader>
              <SaleForm onDone={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </CardHeader>

        <SalesList />
      </Card>
    </div>
  );
}
