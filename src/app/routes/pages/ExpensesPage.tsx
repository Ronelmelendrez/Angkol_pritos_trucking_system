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
import { ExpenseFiltersBar } from "@/features/expenses/components/ExpenseFilters";
import { DatePresets, type DatePreset } from "@/components/ui/DatePresets";
import type { Expense } from "@/features/expenses/types";
import { ExpenseList } from "@/features/expenses/components/ExpenseList";
import { ExpenseGridCard } from "@/features/expenses/components/ExpenseGridCard";
import { TransactionViewTabs } from "@/components/layout/TransactionViewTabs";
import { formatCurrency } from "@/utils/currency";
import { CATEGORY_COLORS } from "@/lib/constants";
import type { ExpenseFilters as ExpenseFiltersType } from "@/features/expenses/types";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function ExpensesPage() {
  const { user } = useAuth();
  const isEmployee = user?.role === "staff";
  const { data: expenses = [], isLoading } = useExpenses();
  const [filters, setFilters] = useState<ExpenseFiltersType>({});
  const [datePreset, setDatePreset] = useState<DatePreset>("this-month");
  const [customFrom, setCustomFrom] = useState(format(new Date(), "yyyy-MM-dd"));
  const [customTo, setCustomTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const [dialogOpen, setDialogOpen] = useState(false);

  const effectiveDateFrom = useMemo(() => {
    const now = new Date();
    switch (datePreset) {
      case "today": return format(now, "yyyy-MM-dd");
      case "this-week": return format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
      case "this-month": return format(startOfMonth(now), "yyyy-MM-dd");
      case "custom": return customFrom;
    }
  }, [datePreset, customFrom]);

  const effectiveDateTo = useMemo(() => {
    const now = new Date();
    switch (datePreset) {
      case "today": return format(now, "yyyy-MM-dd");
      case "this-week": return format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
      case "this-month": return format(endOfMonth(now), "yyyy-MM-dd");
      case "custom": return customTo;
    }
  }, [datePreset, customTo]);

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
    (data: Expense[]) => <ExpenseList expenses={data} isLoading={isLoading} hideDelete={isEmployee} />,
    [isLoading, isEmployee],
  );

  const renderGridCard = useCallback(
    (expense: Expense) => <ExpenseGridCard expense={expense} hideDelete={isEmployee} />,
    [isEmployee],
  );

  // Employee: only show the add expense form
  if (isEmployee) {
    return (
      <div className="space-y-5">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Add new expense</CardTitle>
              <CardDescription>Log an expense for the business.</CardDescription>
            </div>
          </CardHeader>
          <div className="px-6 pb-6">
            <ExpenseForm />
          </div>
        </Card>
      </div>
    );
  }

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
            <DatePresets
              value={datePreset}
              onChange={setDatePreset}
              customFrom={customFrom}
              customTo={customTo}
              onCustomFromChange={setCustomFrom}
              onCustomToChange={setCustomTo}
            />
          }
        />
      </Card>
    </div>
  );
}
