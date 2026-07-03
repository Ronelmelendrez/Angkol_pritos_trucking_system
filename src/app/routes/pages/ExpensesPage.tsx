import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { useExpenses } from "@/features/expenses/hooks/useExpenses";
import { ExpenseForm } from "@/features/expenses/components/ExpenseForm";
import { ExpenseFilters } from "@/features/expenses/components/ExpenseFilters";
import { ExpenseList } from "@/features/expenses/components/ExpenseList";
import { formatCurrency } from "@/utils/currency";
import type { ExpenseFilters as ExpenseFiltersType } from "@/features/expenses/types";

export function ExpensesPage() {
  const { data: expenses = [], isLoading } = useExpenses();
  const [filters, setFilters] = useState<ExpenseFiltersType>({});
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (filters.category && filters.category !== "All" && e.category !== filters.category) return false;
      if (filters.paymentMethod && filters.paymentMethod !== "All" && e.paymentMethod !== filters.paymentMethod)
        return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!e.description.toLowerCase().includes(q) && !(e.supplier ?? "").toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [expenses, filters]);

  const dailyTotal = filtered.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Expense tracking</CardTitle>
            <CardDescription>
              {filtered.length} transaction{filtered.length === 1 ? "" : "s"} · Total{" "}
              <span className="font-semibold text-ink">{formatCurrency(dailyTotal)}</span>
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" /> Add expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log a new expense</DialogTitle>
              </DialogHeader>
              <ExpenseForm onDone={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </CardHeader>

        <div className="mb-4">
          <ExpenseFilters filters={filters} onChange={setFilters} />
        </div>

        <ExpenseList expenses={filtered} isLoading={isLoading} />
      </Card>
    </div>
  );
}