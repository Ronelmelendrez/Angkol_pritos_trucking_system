import { useState, useMemo } from "react";
import { ChevronDown, Receipt, Plus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { CATEGORY_COLORS } from "@/lib/constants";
import { cn } from "@/utils/cn";
import { useDeleteExpense } from "../hooks/useExpenses";
import { useToast } from "@/components/ui/useToast";
import { useSales } from "@/features/sales/hooks/useSales";
import { BatchProgress } from "@/features/sales/components/BatchProgress";
import { SaleForm } from "@/features/sales/components/SaleForm";
import type { Expense } from "../types";

interface Props {
  expenses: Expense[];
  isLoading: boolean;
}

export function ExpenseDayList({ expenses, isLoading }: Props) {
  const deleteExpense = useDeleteExpense();
  const { toast } = useToast();
  const { data: sales = [] } = useSales();

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [logSaleExpenseId, setLogSaleExpenseId] = useState<string | null>(null);

  const salesByExpense = useMemo(() => {
    const map = new Map<string, typeof sales>();
    for (const sale of sales) {
      if (!sale.expenseId) continue;
      const list = map.get(sale.expenseId) ?? [];
      list.push(sale);
      map.set(sale.expenseId, list);
    }
    return map;
  }, [sales]);

  const recoveryByExpense = useMemo(() => {
    const map = new Map<string, number>();
    for (const sale of sales) {
      if (!sale.expenseId) continue;
      map.set(sale.expenseId, (map.get(sale.expenseId) ?? 0) + sale.amount);
    }
    return map;
  }, [sales]);

  const groups = useMemo(() => {
    const map = new Map<string, Expense[]>();
    for (const exp of expenses) {
      const list = map.get(exp.date) ?? [];
      list.push(exp);
      map.set(exp.date, list);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [expenses]);

  function toggle(date: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  }

  async function handleDelete(id: string, description: string) {
    const linkedCount = sales.filter((s) => s.expenseId === id).length;
    if (linkedCount > 0) {
      toast({
        title: `${linkedCount} sale${linkedCount === 1 ? "" : "s"} linked`,
        description: "They'll become unlinked, not deleted.",
        variant: "default",
      });
    }
    try {
      await deleteExpense.mutateAsync(id);
      toast({ title: "Expense removed", description, variant: "default" });
    } catch {
      toast({ title: "Couldn't remove expense", variant: "error" });
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-line p-4">
            <Skeleton className="mb-3 h-5 w-44" />
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line py-14 text-center">
        <Receipt className="mb-2 h-8 w-8 text-ink-faint" />
        <p className="text-sm font-medium text-ink">No expenses match these filters</p>
        <p className="text-xs text-ink-faint">Try clearing a filter or log a new expense.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Dialog open={!!logSaleExpenseId} onOpenChange={(open) => !open && setLogSaleExpenseId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log a sale</DialogTitle>
          </DialogHeader>
          {logSaleExpenseId && (
            <SaleForm
              preselectedExpenseId={logSaleExpenseId}
              onDone={() => setLogSaleExpenseId(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {groups.map(([date, items]) => {
        const isOpen = !collapsed.has(date);
        const dayTotal = items.reduce((sum, e) => sum + e.amount, 0);

        return (
          <div key={date} className="rounded-xl border border-line bg-surface overflow-hidden">
            <button
              type="button"
              onClick={() => toggle(date)}
              className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition-colors hover:bg-primary/[0.03]"
            >
              <div className="flex items-center gap-3">
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-ink-faint transition-transform",
                    !isOpen && "-rotate-90",
                  )}
                />
                <span className="stamp text-base font-semibold text-ink">{formatDate(date)}</span>
                <span className="text-sm text-ink-soft">
                  {items.length} item{items.length === 1 ? "" : "s"}
                </span>
              </div>
              <span className="font-semibold text-ink">{formatCurrency(dayTotal)}</span>
            </button>

            {isOpen && (
              <div className="divide-y divide-dashed divide-line border-t border-line">
                {items.map((exp) => {
                  const recovered = recoveryByExpense.get(exp.id) ?? 0;
                  const linkedSales = salesByExpense.get(exp.id) ?? [];
                  return (
                    <div key={exp.id}>
                      <div className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm hover:bg-primary/[0.02]">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <Badge
                            className="shrink-0 border-0"
                            style={{
                              backgroundColor: `${CATEGORY_COLORS[exp.category]}1a`,
                              color: CATEGORY_COLORS[exp.category],
                            }}
                          >
                            {exp.category}
                          </Badge>
                          <span className="truncate text-ink">{exp.description}</span>
                          {exp.supplier && (
                            <span className="hidden sm:inline shrink-0 text-ink-faint">· {exp.supplier}</span>
                          )}
                        </div>
                        <span className="shrink-0 font-semibold text-ink">{formatCurrency(exp.amount)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-ink-faint hover:text-danger"
                          onClick={() => handleDelete(exp.id, exp.description)}
                          aria-label={`Delete ${exp.description}`}
                        >
                          <Receipt className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      <div className="px-5 pb-3 pt-0">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <BatchProgress recovered={recovered} total={exp.amount} />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shrink-0 gap-1"
                            onClick={() => setLogSaleExpenseId(exp.id)}
                          >
                            <Plus className="h-3.5 w-3.5" /> Log sale
                          </Button>
                        </div>

                        {linkedSales.length > 0 && (
                          <div className="mt-2 space-y-1 border-t border-dashed border-line pt-2">
                            {linkedSales.map((sale) => (
                              <div key={sale.id} className="flex items-center justify-between text-xs text-ink-soft">
                                <span>{sale.description}{sale.quantitySold != null ? ` (${sale.quantitySold} units)` : ""}</span>
                                <span className="font-medium text-ink">{formatCurrency(sale.amount)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
