import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { formatCurrencyCompact, formatQty } from "@/utils/currency";
import type { AdjustmentByProductRow } from "../hooks/useAdjustmentReport";

interface Props {
  data: AdjustmentByProductRow[];
}

export function AdjustmentByProductChart({ data }: Props) {
  const maxMetric = Math.max(1, ...data.map((row) => row.cost ?? row.qty));

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Worst offenders</CardTitle>
          <CardDescription>Ranked by est. ₱ lost</CardDescription>
        </div>
      </CardHeader>
      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-faint">No loss incidents this period.</p>
      ) : (
        <div className="space-y-3">
          {data.map((row) => {
            const metric = row.cost ?? row.qty;
            const pct = Math.max(2, (metric / maxMetric) * 100);
            return (
              <div key={row.productId}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate font-medium text-ink" title={`${row.name} — ${formatQty(row.qty)} units`}>
                    {row.name}
                  </span>
                  <span className="shrink-0 font-semibold text-ink-soft">
                    {row.cost != null ? formatCurrencyCompact(row.cost) : "—"}
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-ink/5">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: "#C0392B" }}
                    title={row.cost != null ? formatCurrencyCompact(row.cost) : "Cost data unavailable"}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
