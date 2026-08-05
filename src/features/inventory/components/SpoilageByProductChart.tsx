import { formatCurrencyCompact, formatQty } from "@/utils/currency";
import type { SpoilageByProductRow } from "../hooks/useSpoilageReport";

interface Props {
  data: SpoilageByProductRow[];
}

export function SpoilageByProductChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-xs text-ink-faint">
        No loss incidents this period.
      </p>
    );
  }

  const maxMetric = Math.max(1, ...data.map((row) => row.cost ?? row.qty));

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-ink-faint">Worst offenders, ranked by est. ₱ lost</p>
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
  );
}
