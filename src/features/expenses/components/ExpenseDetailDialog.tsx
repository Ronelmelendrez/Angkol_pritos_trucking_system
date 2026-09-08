import type { ReactNode } from "react";
import { Building2, CalendarDays, Landmark, PackageCheck, Store, Tag, Wallet } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { CATEGORY_COLORS, FUND_SOURCE_LABELS } from "@/lib/constants";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Expense } from "../types";
import type { Branch } from "@/features/branches/types";

function DetailItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-line bg-ink/[0.02] px-2.5 py-1.5">
      <span className="shrink-0 text-ink-faint">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-ink-faint">{label}</p>
        <p className="truncate text-sm font-medium text-ink">{value}</p>
      </div>
    </div>
  );
}

interface Props {
  expense: Expense | null;
  onClose: () => void;
  branches: Branch[];
}

export function ExpenseDetailDialog({ expense, onClose, branches }: Props) {
  const { user } = useAuth();
  const isAdminAdded = !!expense?.createdBy && expense.createdBy === user?.id;
  const branch = expense?.branchId ? branches.find((b) => b.id === expense.branchId) : undefined;
  const trackingStock = !!expense?.trackingStock;

  return (
    <Dialog open={!!expense} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary-dark" />
              View expense
            </DialogTitle>
            {expense && (
              <span className="text-xl font-bold text-ink">{formatCurrency(expense.amount)}</span>
            )}
          </div>
        </DialogHeader>

        {expense ? (
          <div className="space-y-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                className="border-0"
                style={{
                  backgroundColor: `${CATEGORY_COLORS[expense.category]}1a`,
                  color: CATEGORY_COLORS[expense.category],
                }}
              >
                {expense.category}
              </Badge>
              <span className="text-xs text-ink-faint">{formatDate(expense.date)}</span>
            </div>

            <p className="text-sm text-ink">{expense.description}</p>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {isAdminAdded ? (
                <DetailItem
                  icon={<PackageCheck className="h-3.5 w-3.5" />}
                  label="Tracking stock"
                  value={trackingStock ? "Yes — linked to inventory" : "None"}
                />
              ) : (
                <DetailItem
                  icon={<Building2 className="h-3.5 w-3.5" />}
                  label="Branch"
                  value={branch?.name ?? "—"}
                />
              )}
              <DetailItem
                icon={<CalendarDays className="h-3.5 w-3.5" />}
                label="Date"
                value={formatDate(expense.date)}
              />
              <DetailItem
                icon={<Wallet className="h-3.5 w-3.5" />}
                label="Payment method"
                value={expense.paymentMethod}
              />
              {expense.paymentMethod === "Cash" && expense.fundSource && (
                <DetailItem
                  icon={<Landmark className="h-3.5 w-3.5" />}
                  label="Fund source"
                  value={FUND_SOURCE_LABELS[expense.fundSource]}
                />
              )}
              {expense.supplier && (
                <DetailItem icon={<Store className="h-3.5 w-3.5" />} label="Supplier" value={expense.supplier} />
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}