import {
  Printer,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Scale,
  CheckCircle2,
  AlertTriangle,
  CircleDollarSign,
  HandCoins,
  TrendingUp,
  TrendingDown,
  ReceiptText,
  ShoppingBag,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { formatDate, formatTime } from "@/utils/date";
import { cn } from "@/utils/cn";
import { useDailyCash } from "../hooks/useDailyCash";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { StatChip, chipTones, type ChipTone } from "@/components/ui/StatChip";
import type { CashMovementItem, CashMovementType } from "../types";

function MoneyRow({ label, amount, total = false }: { label: string; amount: number; total?: boolean }) {
  const negative = amount < 0;
  return (
    <div
      className={cn(
        "flex items-center justify-between text-sm",
        total && "border-t border-dashed border-line pt-2 font-semibold text-ink",
      )}
    >
      <span className={total ? "font-semibold text-ink" : "text-ink-soft"}>{label}</span>
      <span className={cn("tabular-nums", negative ? "text-danger" : total ? "text-primary-dark" : "text-ink")}>
        {formatCurrency(amount)}
      </span>
    </div>
  );
}

function SectionLabel({
  icon: Icon,
  tone,
  children,
}: {
  icon: LucideIcon;
  tone: ChipTone;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("flex h-6 w-6 items-center justify-center rounded-md", chipTones[tone])}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">{children}</p>
    </div>
  );
}

const MOVEMENT_STYLES: Record<CashMovementType, { icon: LucideIcon; chip: string }> = {
  opening: { icon: Wallet, chip: "bg-primary/15 text-primary-dark" },
  sale: { icon: ArrowDownLeft, chip: "bg-success-bg text-success" },
  order_deposit: { icon: ShoppingBag, chip: "bg-blue-100 text-blue-700" },
  expense: { icon: ArrowUpRight, chip: "bg-danger-bg text-danger" },
  advance: { icon: HandCoins, chip: "bg-warning-bg text-warning" },
  withdrawal: { icon: CircleDollarSign, chip: "bg-ink/10 text-ink" },
};

function MovementRow({ item, index, isLast }: { item: CashMovementItem; index: number; isLast: boolean }) {
  const style = MOVEMENT_STYLES[item.type];
  return (
    <li className="relative flex items-center gap-3 py-2">
      {index > 0 && (
        <span aria-hidden className="absolute left-[17px] top-0 h-[calc(50%-18px)] w-px bg-line" />
      )}
      {!isLast && (
        <span aria-hidden className="absolute left-[17px] top-[calc(50%+18px)] h-[calc(50%-18px)] w-px bg-line" />
      )}
      <span
        className={cn(
          "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          style.chip,
        )}
      >
        <style.icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{item.label}</p>
        <p className="text-xs text-ink-faint">{formatTime(item.time)}</p>
      </div>
      <div className="shrink-0 text-right">
        <span
          className={cn(
            "inline-block rounded-lg px-2 py-0.5 text-xs font-bold tabular-nums",
            style.chip,
          )}
        >
          {item.amount > 0 ? "+" : ""}
          {formatCurrency(item.amount)}
        </span>
        <p className="mt-1 text-[11px] tabular-nums text-ink-faint">Bal {formatCurrency(item.balance)}</p>
      </div>
    </li>
  );
}

export function DailyCashReport({ date }: { date: string }) {
  const { data, isLoading } = useDailyCash(date);
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  const difference = data.difference ?? (data.actualCash != null ? data.actualCash - data.expectedCash : null);
  const hasCount = data.actualCash != null;
  const balanced = difference === 0;

  const statusPill = !hasCount ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 text-xs font-semibold text-white">
      <AlertTriangle className="h-3.5 w-3.5" /> Not counted yet
    </span>
  ) : balanced ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-success">
      <CheckCircle2 className="h-3.5 w-3.5" /> Balanced
    </span>
  ) : difference! > 0 ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-ink">
      <TrendingUp className="h-3.5 w-3.5 text-success" /> Over by {formatCurrency(difference!)}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-danger">
      <TrendingDown className="h-3.5 w-3.5" /> Short by {formatCurrency(-difference!)}
    </span>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="stamp text-lg font-semibold text-ink">Daily cash report</h3>
          <p className="text-xs text-ink-faint">{formatDate(date)} · Cashier: {user?.name ?? "—"}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Print
        </Button>
      </div>

      <div className="print-report-area space-y-4">
        {/* Hero — expected cash balance */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-secondary p-5 text-white shadow-lg">
          <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-16 right-20 h-28 w-28 rounded-full bg-white/5" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/80">Expected cash</p>
              <Wallet className="h-4 w-4 text-white/80" />
            </div>
            <p className="stamp mt-2 text-3xl font-bold tabular-nums tracking-tight">
              {formatCurrency(data.expectedCash)}
            </p>
            <div className="mt-3">{statusPill}</div>
          </div>
        </div>

        {/* Stat chips */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatChip label="Opening cash" value={formatCurrency(data.openingCash ?? 0)} icon={Wallet} />
          <StatChip label="Cash in" value={formatCurrency(data.totalCashIn)} icon={ArrowDownLeft} tone="success" />
          <StatChip label="Cash out" value={formatCurrency(data.totalCashOut)} icon={ArrowUpRight} tone="danger" />
          <StatChip
            label="Actual cash"
            value={hasCount ? formatCurrency(data.actualCash!) : "—"}
            icon={CircleDollarSign}
            tone="primary"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Statement */}
          <Card className="h-full">
            <CardHeader>
              <div className="flex w-full flex-col items-center gap-1 text-center pb-8">
                <ReceiptText className="h-5 w-5 text-primary-dark" />
                <div>
                  <CardTitle>Daily cash statement</CardTitle>
                  <CardDescription>Angkol Prito's · {formatDate(date)}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="space-y-5">
                <section className="space-y-2">
                  <SectionLabel icon={Wallet} tone="neutral">Opening cash</SectionLabel>
                  <MoneyRow label="Cash on hand" amount={data.openingCash ?? 0} />
                </section>

                <section className="space-y-2">
                  <SectionLabel icon={ArrowDownLeft} tone="success">Cash in</SectionLabel>
                  <MoneyRow label="Cash sales" amount={data.cashSales} />
                  {data.orderDeposits > 0 && (
                    <MoneyRow label="Order deposits" amount={data.orderDeposits} />
                  )}
                  {data.orderBalancePayments > 0 && (
                    <MoneyRow label="Order balance payments" amount={data.orderBalancePayments} />
                  )}
                  {data.otherIncome > 0 && <MoneyRow label="Other income" amount={data.otherIncome} />}
                  <MoneyRow label="Total cash in" amount={data.totalCashIn} total />
                </section>

                <section className="space-y-2">
                  <SectionLabel icon={ArrowUpRight} tone="danger">Cash out</SectionLabel>
                  <MoneyRow label="Expenses" amount={-data.cashExpenses} />
                  <MoneyRow label="Cash advances" amount={-data.cashAdvances} />
                  <MoneyRow label="Owner withdrawal" amount={-data.ownerWithdrawals} />
                  <MoneyRow label="Total cash out" amount={-data.totalCashOut} total />
                </section>

                <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/10 px-4 py-3">
                  <span className="stamp text-sm font-semibold text-primary-dark">Expected cash</span>
                  <span className="stamp text-lg font-bold tabular-nums text-primary-dark">
                    {formatCurrency(data.expectedCash)}
                  </span>
                </div>

                <section className="space-y-2">
                  <SectionLabel icon={Scale} tone="neutral">Cash count</SectionLabel>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-soft">Actual cash count</span>
                    <span className="font-semibold tabular-nums text-ink">
                      {hasCount ? formatCurrency(data.actualCash!) : "Not counted"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-soft">Difference</span>
                    <span
                      className={cn(
                        "flex items-center gap-1.5 font-semibold tabular-nums",
                        !hasCount ? "text-ink-faint" : balanced ? "text-success" : "text-danger",
                      )}
                    >
                      {hasCount && (balanced ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />)}
                      {hasCount ? formatCurrency(difference!) : "—"}
                    </span>
                  </div>
                  {data.cashCount?.remarks && (
                    <div className="flex items-start justify-between gap-3 text-sm">
                      <span className="shrink-0 text-ink-soft">Remarks</span>
                      <span className="text-right text-ink">{data.cashCount.remarks}</span>
                    </div>
                  )}
                </section>

                {hasCount && (
                  <div className="grid grid-cols-2 gap-4 border-t border-dashed border-line pt-5">
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
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="h-full">
            <CardHeader>
              <div className="flex w-full flex-col items-center gap-1 text-center pb-8">
                <Scale className="h-5 w-5 text-primary-dark" />
                <div>
                  <CardTitle>Cash movement</CardTitle>
                  <CardDescription>Opening + cash in − cash out</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {data.movements.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line py-12 text-center">
                  <p className="text-sm font-medium text-ink">No cash movements yet</p>
                  <p className="mt-1 text-xs text-ink-faint">Record opening cash and transactions to build the timeline.</p>
                </div>
              ) : (
                <ol className="space-y-1">
                  {data.movements.map((item, index) => (
                    <MovementRow
                      key={item.id}
                      item={item}
                      index={index}
                      isLast={index === data.movements.length - 1}
                    />
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
