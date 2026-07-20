import { useMemo, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { useExpenses } from "@/features/expenses/hooks/useExpenses";
import { ExpenseForm } from "@/features/expenses/components/ExpenseForm";
import { ExpenseFilters } from "@/features/expenses/components/ExpenseFilters";
import { ExpenseList } from "@/features/expenses/components/ExpenseList";
import { ExpenseGridCard } from "@/features/expenses/components/ExpenseGridCard";
import { TransactionViewTabs } from "@/components/layout/TransactionViewTabs";
import { formatCurrency } from "@/utils/currency";
import { CATEGORY_COLORS } from "@/lib/constants";
import type { Expense } from "@/features/expenses/types";
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
      if (filters.dateFrom && e.date < filters.dateFrom) return false;
      if (filters.dateTo && e.date > filters.dateTo) return false;
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

  const renderTable = useCallback(
    (data: Expense[]) => <ExpenseList expenses={data} isLoading={isLoading} />,
    [isLoading],
  );

  const renderGridCard = useCallback(
    (expense: Expense) => <ExpenseGridCard expense={expense} />,
    [],
  );

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

        <TransactionViewTabs
          data={filtered}
          isLoading={isLoading}
          getDate={(e) => e.date}
          getAmount={(e) => e.amount}
          renderTable={renderTable}
          renderGridCard={renderGridCard}
          groupedTabLabel="By Category"
          getGroupKey={(e) => e.category}
          getGroupColor={(key) => CATEGORY_COLORS[key as keyof typeof CATEGORY_COLORS] ?? "#888"}
          emptyMessage="No expenses match these filters"
        />
      </Card>
    </div>
  );
}