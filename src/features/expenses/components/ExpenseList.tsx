import { Trash2, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { CATEGORY_COLORS } from "@/lib/constants";
import { useDeleteExpense } from "../hooks/useExpenses";
import { useToast } from "@/components/ui/use-toast";
import type { Expense } from "../types";

interface Props {
  expenses: Expense[];
  isLoading: boolean;
}

export function ExpenseList({ expenses, isLoading }: Props) {
  const deleteExpense = useDeleteExpense();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
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

  async function handleDelete(id: string, description: string) {
    try {
      await deleteExpense.mutateAsync(id);
      toast({ title: "Expense removed", description, variant: "default" });
    } catch {
      toast({ title: "Couldn't remove expense", variant: "error" });
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <table className="w-full text-sm">
        <thead className="bg-ink/[0.03] text-left text-xs uppercase tracking-wide text-ink-soft">
          <tr>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium hidden sm:table-cell">Description</th>
            <th className="px-4 py-3 font-medium hidden md:table-cell">Supplier</th>
            <th className="px-4 py-3 text-right font-medium">Amount</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {expenses.map((exp) => (
            <tr key={exp.id} className="bg-surface hover:bg-primary/[0.03]">
              <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{formatDate(exp.date)}</td>
              <td className="px-4 py-3">
                <Badge
                  className="border-0"
                  style={{
                    backgroundColor: `${CATEGORY_COLORS[exp.category]}1a`,
                    color: CATEGORY_COLORS[exp.category],
                  }}
                >
                  {exp.category}
                </Badge>
              </td>
              <td className="hidden max-w-[220px] truncate px-4 py-3 text-ink sm:table-cell">
                {exp.description}
              </td>
              <td className="hidden px-4 py-3 text-ink-soft md:table-cell">{exp.supplier || "—"}</td>
              <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-ink">
                {formatCurrency(exp.amount)}
              </td>
              <td className="px-2 py-3 text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-ink-faint hover:text-danger"
                  onClick={() => handleDelete(exp.id, exp.description)}
                  aria-label={`Delete ${exp.description}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}