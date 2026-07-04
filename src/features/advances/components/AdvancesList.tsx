import { HandCoins, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { useMarkAdvanceDeducted } from "../hooks/useAdvances";
import { useToast } from "@/components/ui/useToast";
import type { CashAdvance } from "../types";
import type { Employee } from "@/features/employees/types";

interface Props {
  advances: CashAdvance[];
  employees: Employee[];
  isLoading: boolean;
}

export function AdvancesList({ advances, employees, isLoading }: Props) {
  const markDeducted = useMarkAdvanceDeducted();
  const { toast } = useToast();

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

  const employeeName = (id: string) => employees.find((e) => e.id === id)?.name ?? "Unknown";

  async function handleMarkDeducted(id: string) {
    try {
      await markDeducted.mutateAsync(id);
      toast({ title: "Marked as deducted from payroll", variant: "success" });
    } catch {
      toast({ title: "Couldn't update advance", variant: "error" });
    }
  }

  return (
    <div className="space-y-3">
      {advances.map((adv) => (
        <div key={adv.id} className="ticket ticket-perf flex items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="font-semibold text-ink">{employeeName(adv.employeeId)}</p>
            <p className="truncate text-xs text-ink-soft">
              {formatDate(adv.date)} {adv.reason ? `· ${adv.reason}` : ""}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="font-semibold text-ink">{formatCurrency(adv.amount)}</span>
            <Badge variant={adv.status === "pending" ? "warning" : "success"}>
              {adv.status === "pending" ? "Pending" : "Deducted"}
            </Badge>
            {adv.status === "pending" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarkDeducted(adv.id)}
                disabled={markDeducted.isPending}
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Deduct
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}