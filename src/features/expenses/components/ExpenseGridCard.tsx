import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { CATEGORY_COLORS } from "@/lib/constants";
import { useDeleteExpense } from "../hooks/useExpenses";
import { useToast } from "@/components/ui/useToast";
import type { Expense } from "../types";

interface Props {
  expense: Expense;
}

export function ExpenseGridCard({ expense }: Props) {
  const deleteExpense = useDeleteExpense();
  const { toast } = useToast();

  async function handleDelete() {
    try {
      await deleteExpense.mutateAsync(expense.id);
      toast({ title: "Expense removed", description: expense.description, variant: "default" });
    } catch {
      toast({ title: "Couldn't remove expense", variant: "error" });
    }
  }

  return (
    <div className="ticket ticket-perf flex flex-col gap-2 p-4">
      <div className="flex items-start justify-between gap-2">
        <Badge
          className="shrink-0 border-0"
          style={{
            backgroundColor: `${CATEGORY_COLORS[expense.category]}1a`,
            color: CATEGORY_COLORS[expense.category],
          }}
        >
          {expense.category}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-ink-faint hover:text-danger"
          onClick={handleDelete}
          aria-label={`Delete ${expense.description}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <p className="text-lg font-bold text-ink">{formatCurrency(expense.amount)}</p>

      <p className="truncate text-sm text-ink">{expense.description}</p>

      <div className="mt-auto flex items-center justify-between text-xs text-ink-faint">
        <span>{formatDate(expense.date)}</span>
        {expense.supplier && <span>{expense.supplier}</span>}
      </div>
    </div>
  );
}
