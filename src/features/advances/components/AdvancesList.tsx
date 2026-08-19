import { useState } from "react";
import { HandCoins, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/AlertDialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { useDeleteAdvance } from "../hooks/useAdvances";
import { useToast } from "@/components/ui/useToast";
import type { CashAdvance } from "../types";
import type { Employee } from "@/features/employees/types";

const PAGE_SIZE = 10;

interface Props {
  advances: CashAdvance[];
  employees: Employee[];
  isLoading: boolean;
  hideDelete?: boolean;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export function AdvancesList({ advances, employees, isLoading, hideDelete }: Props) {
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<CashAdvance | null>(null);
  const deleteAdvance = useDeleteAdvance();
  const { toast } = useToast();

  const grouped = employees
    .map((emp) => ({
      employee: emp,
      records: advances
        .filter((a) => a.employeeId === emp.id)
        .sort((a, b) => b.date.localeCompare(a.date)),
    }))
    .filter((g) => g.records.length > 0);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteAdvance.mutateAsync(deleteTarget.id);
      toast({ title: "Advance removed", variant: "success" });
    } catch {
      toast({ title: "Couldn't remove advance", variant: "error" });
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

  if (advances.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line py-14 text-center">
        <HandCoins className="mb-2 h-8 w-8 text-ink-faint" />
        <p className="text-sm font-medium text-ink">No cash advances recorded</p>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(grouped.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageGroups = grouped.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div>
      <div className="space-y-6">
        {pageGroups.map(({ employee, records }) => {
          const pendingTotal = records
            .filter((r) => r.status === "pending")
            .reduce((s, r) => s + r.amount, 0);

          return (
            <section key={employee.id}>
              <div className="mb-2 flex items-center gap-2.5">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: employee.avatarColor }}
                >
                  {initials(employee.name)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{employee.name}</p>
                  <p className="text-xs text-ink-faint">
                    {records.length} record{records.length === 1 ? "" : "s"}
                    {pendingTotal > 0 && ` · ${formatCurrency(pendingTotal)} pending`}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {records.map((adv) => (
                  <div key={adv.id} className="ticket ticket-perf flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-xs text-ink-soft">
                        {formatDate(adv.date)} {adv.reason ? `· ${adv.reason}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-semibold text-ink">{formatCurrency(adv.amount)}</span>
                      <Badge variant={adv.status === "pending" ? "warning" : "success"}>
                        {adv.status === "pending" ? "Pending" : "Deducted"}
                      </Badge>
                      {!hideDelete && adv.status === "deducted" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-ink-faint hover:text-danger"
                          onClick={() => setDeleteTarget(adv)}
                          aria-label="Delete advance"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-6">
        <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete advance</AlertDialogTitle>
            <AlertDialogDescription>
              Remove this deducted advance from the record? This cannot be undone.
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
