import { useMemo, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { startOfWeek } from "date-fns/startOfWeek";
import { endOfWeek } from "date-fns/endOfWeek";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { useExpenses } from "@/features/expenses/hooks/useExpenses";
import { ExpenseForm } from "@/features/expenses/components/ExpenseForm";
import { ExpenseFiltersBar, ExpenseDatePresets } from "@/features/expenses/components/ExpenseFilters";
import type { DatePreset } from "@/features/expenses/components/ExpenseFilters";
import type { Expense } from "@/features/expenses/types";
import { ExpenseList } from "@/features/expenses/components/ExpenseList";
import { ExpenseGridCard } from "@/features/expenses/components/ExpenseGridCard";
import { TransactionViewTabs } from "@/components/layout/TransactionViewTabs";
import { formatCurrency } from "@/utils/currency";
import { CATEGORY_COLORS } from "@/lib/constants";
import type { ExpenseFilters as ExpenseFiltersType } from "@/features/expenses/types";

export function ExpensesPage() {
  const { data: expenses = [], isLoading } = useExpenses();
  const [filters, setFilters] = useState<ExpenseFiltersType>({});
  const [datePreset, setDatePreset] = useState<DatePreset>("this-month");
  const [dialogOpen, setDialogOpen] = useState(false);

  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");

  const effectiveDateFrom = useMemo(() => {
    switch (datePreset) {
      case "today": return todayStr;
      case "this-week": return format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
      case "this-month": return format(startOfMonth(today), "yyyy-MM-dd");
      case "custom": return filters.dateFrom;
    }
  }, [datePreset, filters.dateFrom, todayStr]);

  const effectiveDateTo = useMemo(() => {
    switch (datePreset) {
      case "today": return todayStr;
      case "this-week": return format(endOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
      case "this-month": return format(endOfMonth(today), "yyyy-MM-dd");
      case "custom": return filters.dateTo;
    }
  }, [datePreset, filters.dateTo, todayStr]);

  function handlePresetChange(preset: DatePreset) {
    setDatePreset(preset);
  }

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (effectiveDateFrom && e.date < effectiveDateFrom) return false;
      if (effectiveDateTo && e.date > effectiveDateTo) return false;
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
  }, [expenses, filters, effectiveDateFrom, effectiveDateTo]);

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
          <ExpenseFiltersBar filters={filters} onChange={setFilters} />
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
          filters={
            <ExpenseDatePresets filters={filters} onChange={setFilters} datePreset={datePreset} onPresetChange={handlePresetChange} />
          }
        />
      </Card>
    </div>
  );
}