import { Printer, Wallet, ArrowDownLeft, ArrowUpRight, Scale, CheckCircle2, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { formatDate, formatTime } from "@/utils/date";
import { cn } from "@/utils/cn";
import { useDailyCash } from "../hooks/useDailyCash";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import type { CashMovementItem } from "../types";

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "primary" | "success" | "danger" | "neutral";
}) {
  const tones: Record<typeof tone, string> = {
    primary: "bg-primary/10 text-primary-dark",
    success: "bg-success-bg text-success",
    danger: "bg-danger-bg text-danger",
    neutral: "bg-ink/5 text-ink",
  };
  return (
    <div className="flex items-start justify-between rounded-xl border border-line bg-surface px-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium uppercase tracking-wide text-ink-faint">{label}</p>
        <p className={cn("stamp mt-0.5 text-lg font-semibold", tone === "neutral" ? "text-ink" : "")}>{value}</p>
      </div>
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", tones[tone])}>
        <Wallet className="h-4 w-4" />
      </div>
    </div>
  );
}

function MoneyRow({ label, amount, total = false }: { label: string; amount: number; total?: boolean }) {
  const negative = amount < 0;
  return (
    <div
      className={cn(
        "flex items-center justify-between",
        total ? "border-t border-line pt-2 font-semibold text-ink" : "text-sm",
      )}
    >
      <span className={total ? "font-semibold" : "text-ink-soft"}>{label}</span>
      <span className={cn(negative && "text-danger")}>{formatCurrency(amount)}</span>
    </div>
  );
}

function MovementRow({ item, index }: { item: CashMovementItem; index: number }) {
  const isIn = item.amount > 0;
  const isOpening = item.type === "opening";
  return (
    <div className="relative flex items-center gap-3">
      {index > 0 && <div className="absolute left-[15px] top-[-14px] h-4 w-px bg-line" />}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isOpening ? "bg-primary/15 text-primary-dark" : isIn ? "bg-success-bg text-success" : "bg-danger-bg text-danger",
        )}
      >
        {isIn ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{item.label}</p>
        <p className="text-xs text-ink-faint">{formatTime(item.time)}</p>
      </div>
      <div className="text-right">
        <p className={cn("text-sm font-semibold", item.amount < 0 ? "text-danger" : "text-ink")}>
          {item.amount > 0 ? "+" : ""}
          {formatCurrency(item.amount)}
        </p>
        <p className="text-xs text-ink-faint">Bal {formatCurrency(item.balance)}</p>
      </div>
    </div>
  );
}

export function DailyCashReport({ date }: { date: string }) {
  const { data, isLoading } = useDailyCash(date);
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  const difference = data.difference ?? (data.actualCash != null ? data.actualCash - data.expectedCash : null);
  const hasCount = data.actualCash != null;
  const balanced = difference === 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="stamp text-lg font-semibold text-ink">Daily Cash Report</h3>
          <p className="text-xs text-ink-faint">{formatDate(date)} · Cashier: {user?.name ?? "—"}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Print
        </Button>
      </div>

      <div className="print-report-area">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <SummaryCard label="Opening cash" value={formatCurrency(data.openingCash ?? 0)} tone="neutral" />
          <SummaryCard label="Cash in" value={formatCurrency(data.totalCashIn)} tone="success" />
          <SummaryCard label="Cash out" value={formatCurrency(data.totalCashOut)} tone="danger" />
          <SummaryCard label="Expected cash" value={formatCurrency(data.expectedCash)} tone="primary" />
          <SummaryCard label="Actual cash" value={hasCount ? formatCurrency(data.actualCash!) : "—"} tone="neutral" />
          <SummaryCard
            label="Difference"
            value={difference != null ? formatCurrency(difference) : "—"}
            tone={difference != null && difference !== 0 ? "danger" : "neutral"}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Statement layout */}
          <div className="ticket p-5">
            <div className="mb-4 border-b border-line pb-3 text-center">
              <p className="stamp text-sm font-bold uppercase tracking-wide text-ink">Angkol Prito's</p>
              <p className="text-xs text-ink-faint">Daily Cash Report</p>
              <p className="text-xs text-ink-faint">{formatDate(date)}</p>
            </div>

            <div className="space-y-4">
              <section>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Opening cash</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-soft">Opening cash</span>
                  <span className="font-semibold text-ink">{formatCurrency(data.openingCash ?? 0)}</span>
                </div>
              </section>

              <section className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Cash in</p>
                <MoneyRow label="Cash sales" amount={data.cashSales} />
                {data.otherIncome > 0 && <MoneyRow label="Other income" amount={data.otherIncome} />}
                <MoneyRow label="Total cash in" amount={data.totalCashIn} total />
              </section>

              <section className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Cash out</p>
                <MoneyRow label="Expenses" amount={-data.cashExpenses} />
                <MoneyRow label="Cash advances" amount={-data.cashAdvances} />
                <MoneyRow label="Owner withdrawal" amount={-data.ownerWithdrawals} />
                <MoneyRow label="Total cash out" amount={-data.totalCashOut} total />
              </section>

              <section>
                <div className="flex items-center justify-between rounded-xl bg-primary/10 px-4 py-3">
                  <span className="stamp text-sm font-semibold text-primary-dark">Expected cash</span>
                  <span className="stamp text-lg font-bold text-primary-dark">{formatCurrency(data.expectedCash)}</span>
                </div>
              </section>

              <section className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Cash count</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-soft">Actual cash count</span>
                  <span className="font-semibold text-ink">{hasCount ? formatCurrency(data.actualCash!) : "Not counted"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-soft">Difference</span>
                  <span
                    className={cn(
                      "flex items-center gap-1 font-semibold",
                      !hasCount ? "text-ink-faint" : balanced ? "text-success" : "text-danger",
                    )}
                  >
                    {hasCount && (balanced ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />)}
                    {hasCount ? formatCurrency(difference!) : "—"}
                  </span>
                </div>
                {data.cashCount?.remarks && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ink-soft">Remarks</span>
                    <span className="text-right text-sm text-ink">{data.cashCount.remarks}</span>
                  </div>
                )}
              </section>

              {hasCount && (
                <div className="grid grid-cols-2 gap-4 border-t border-line pt-4">
                  <div className="text-center">
                    <p className="text-[11px] text-ink-faint">Prepared by</p>
                    <div className="mt-6 border-t border-dashed border-ink/30 text-xs text-ink-faint">{user?.name ?? ""}</div>
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] text-ink-faint">Approved by</p>
                    <div className="mt-6 border-t border-dashed border-ink/30 text-xs text-ink-faint">Owner</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="ticket p-5">
            <div className="mb-4 flex items-center gap-2">
              <Scale className="h-4 w-4 text-primary-dark" />
              <h4 className="stamp text-sm font-semibold text-ink">Cash movement timeline</h4>
            </div>
            {data.movements.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line py-12 text-center">
                <p className="text-sm font-medium text-ink">No cash movements yet</p>
                <p className="mt-1 text-xs text-ink-faint">Record opening cash and transactions to build the timeline.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.movements.map((item, index) => (
                  <MovementRow key={item.id} item={item} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
