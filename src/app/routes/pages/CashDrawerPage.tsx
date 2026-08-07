import { useState } from "react";
import { PiggyBank } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Skeleton } from "@/components/ui/Skeleton";
import { CashOpeningForm, CashCountForm } from "@/features/cash";
import { useDailyCash } from "@/features/cash/hooks/useDailyCash";
import { todayISO, formatDate } from "@/utils/date";
import { formatCurrency } from "@/utils/currency";
import { cn } from "@/utils/cn";

function MiniStat({ label, value, tone }: { label: string; value: string; tone?: "success" | "danger" | "primary" }) {
  return (
    <div className="flex items-start justify-between rounded-xl border border-line bg-surface px-3 py-2.5">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">{label}</p>
        <p
          className={cn(
            "stamp mt-0.5 text-base font-semibold text-ink",
            tone === "success" && "text-success",
            tone === "danger" && "text-danger",
            tone === "primary" && "text-primary-dark",
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export function CashDrawerPage() {
  const [date, setDate] = useState(todayISO);
  const { data, isLoading } = useDailyCash(date);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Cash drawer</CardTitle>
            <CardDescription>
              Record the day's opening cash at the start of your shift and submit the closing cash count at the end.
            </CardDescription>
          </div>
          <div className="w-full max-w-52">
            <Label htmlFor="cash-date">Business day</Label>
            <Input id="cash-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </CardHeader>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <MiniStat label="Opening cash" value={formatCurrency(data.openingCash ?? 0)} />
          <MiniStat label="Cash in" value={formatCurrency(data.totalCashIn)} tone="success" />
          <MiniStat label="Cash out" value={formatCurrency(data.totalCashOut)} tone="danger" />
          <MiniStat label="Expected cash" value={formatCurrency(data.expectedCash)} tone="primary" />
          <MiniStat label="Actual cash" value={data.actualCash != null ? formatCurrency(data.actualCash) : "—"} />
          <MiniStat
            label="Difference"
            value={data.difference != null ? formatCurrency(data.difference) : "—"}
            tone={data.difference != null && data.difference !== 0 ? "danger" : undefined}
          />
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PiggyBank className="h-4 w-4 text-primary-dark" />
              <div>
                <CardTitle>Opening cash</CardTitle>
                <CardDescription>{formatDate(date)}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <div className="p-6 pt-0">
            <CashOpeningForm date={date} />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Closing cash count</CardTitle>
              <CardDescription>Reconcile the drawer at end of day · {formatDate(date)}</CardDescription>
            </div>
          </CardHeader>
          <div className="p-6 pt-0">
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <CashCountForm date={date} expectedCash={data.expectedCash} />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

