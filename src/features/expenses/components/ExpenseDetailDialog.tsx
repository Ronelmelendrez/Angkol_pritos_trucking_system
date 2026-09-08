import type { ReactNode } from "react";
import { Building2, CalendarDays, Landmark, PackageCheck, Receipt, Store, Tag, Wallet } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { CATEGORY_COLORS, FUND_SOURCE_LABELS } from "@/lib/constants";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Expense } from "../types";
import type { Branch } from "@/features/branches/types";

function HeroChip({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-surface/80 px-3 py-2">
      <span className="shrink-0 text-primary-dark">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-ink-faint">{label}</p>
        <p className="truncate text-sm font-medium text-ink">{value}</p>
      </div>
    </div>
  );
}

function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm text-ink-faint">
        {icon}
        <span>{label}</span>
      </div>
      <span className="truncate text-sm font-medium text-ink">{children}</span>
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
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary-dark" />
            Expense details
          </DialogTitle>
        </DialogHeader>

        {expense && (
          <div className="space-y-4">
            {/* Hero panel */}
            <div className="overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/15 via-surface to-accent/10 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary-dark">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{expense.description}</p>
                    <span
                      className="mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{
                        backgroundColor: `${CATEGORY_COLORS[expense.category]}1a`,
                        color: CATEGORY_COLORS[expense.category],
                      }}
                    >
                      {expense.category}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-ink-faint">Total</p>
                  <p className="text-2xl font-bold text-ink">{formatCurrency(expense.amount)}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-primary/10 pt-3">
                <HeroChip
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="Date"
                  value={formatDate(expense.date)}
                />
                <HeroChip
                  icon={<Wallet className="h-4 w-4" />}
                  label="Payment method"
                  value={expense.paymentMethod}
                />
              </div>
            </div>

            {/* Details */}
            <div className="rounded-2xl border border-line bg-surface p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                <PackageCheck className="h-3.5 w-3.5" />
                Details
              </div>
              <div className="mt-3 space-y-2.5 border-t border-dashed border-line pt-3">
                {isAdminAdded ? (
                  <Row icon={<PackageCheck className="h-4 w-4" />} label="Tracking stock">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        trackingStock ? "bg-green-100 text-green-700" : "bg-ink/5 text-ink-faint"
                      }`}
                    >
                      {trackingStock ? "Yes — tracked" : "None"}
                    </span>
                  </Row>
                ) : (
                  <Row icon={<Building2 className="h-4 w-4" />} label="Branch">
                    {branch?.name ?? "—"}
                  </Row>
                )}
                {expense.paymentMethod === "Cash" && expense.fundSource && (
                  <Row icon={<Landmark className="h-4 w-4" />} label="Fund source">
                    {FUND_SOURCE_LABELS[expense.fundSource]}
                  </Row>
                )}
                {expense.supplier && (
                  <Row icon={<Store className="h-4 w-4" />} label="Supplier">
                    {expense.supplier}
                  </Row>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}