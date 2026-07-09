import { useMemo } from "react";
import { Trash2, Receipt, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { CATEGORY_COLORS } from "@/lib/constants";
import { cn } from "@/utils/cn";
import { useDeleteExpense } from "../hooks/useExpenses";
import { useToast } from "@/components/ui/useToast";
import type { Expense } from "../types";

interface Props {
  expenses: Expense[];
  isLoading: boolean;
}

export function ExpenseList({ expenses, isLoading }: Props) {
  const deleteExpense = useDeleteExpense();
  const { toast } = useToast();

  const groups = useMemo(() => {
    const map = new Map<string, Expense[]>();
    for (const exp of expenses) {
      const list = map.get(exp.date) ?? [];
      list.push(exp);
      map.set(exp.date, list);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [expenses]);

  async function handleDelete(id: string, description: string) {
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
      {groups.map(([date, items]) => {
        const dayTotal = items.reduce((sum, e) => sum + e.amount, 0);

        return (
          <div key={date} className="overflow-hidden rounded-xl border border-line bg-surface">
            <div className="flex items-center justify-between gap-3 bg-ink/[0.02] px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="stamp text-base font-semibold text-ink">{formatDate(date)}</span>
                <span className="text-sm text-ink-soft">
                  {items.length} item{items.length === 1 ? "" : "s"}
                </span>
              </div>
              <span className="font-semibold text-ink">{formatCurrency(dayTotal)}</span>
            </div>

            <div className="divide-y divide-dashed divide-line">
              {items.map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm hover:bg-primary/[0.02]"
                >
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
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}