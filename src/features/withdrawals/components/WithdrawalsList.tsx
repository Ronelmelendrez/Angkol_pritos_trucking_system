import { useState } from "react";
import { HandCoins, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/AlertDialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { useDeleteOwnerWithdrawal } from "../hooks/useWithdrawals";
import { useToast } from "@/components/ui/useToast";
import type { OwnerWithdrawal } from "../types";

const PAGE_SIZE = 10;

interface Props {
  withdrawals: OwnerWithdrawal[];
  isLoading: boolean;
}

export function WithdrawalsList({ withdrawals, isLoading }: Props) {
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<OwnerWithdrawal | null>(null);
  const deleteWithdrawal = useDeleteOwnerWithdrawal();
  const { toast } = useToast();

  const sorted = [...withdrawals].sort((a, b) => b.date.localeCompare(a.date));

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteWithdrawal.mutateAsync(deleteTarget.id);
      toast({ title: "Withdrawal removed", variant: "success" });
    } catch {
      toast({ title: "Couldn't remove withdrawal", variant: "error" });
    } finally {
      setDeleteTarget(null);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line py-14 text-center">
        <HandCoins className="mb-2 h-8 w-8 text-ink-faint" />
        <p className="text-sm font-medium text-ink">No owner withdrawals recorded</p>
        <p className="text-xs text-ink-faint">Cash taken by the owner appears here.</p>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div>
      <div className="space-y-2">
        {pageRows.map((w) => (
          <div key={w.id} className="ticket ticket-perf flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="truncate text-xs text-ink-soft">{formatDate(w.date)}</p>
              {w.reason && <p className="truncate text-xs text-ink-faint">{w.reason}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="font-semibold text-ink">{formatCurrency(w.amount)}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-ink-faint hover:text-danger"
                onClick={() => setDeleteTarget(w)}
                aria-label="Delete withdrawal"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete withdrawal</AlertDialogTitle>
            <AlertDialogDescription>
              Remove this owner withdrawal from the record? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
