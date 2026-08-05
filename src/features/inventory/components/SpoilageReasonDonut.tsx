import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrencyCompact } from "@/utils/currency";
import { REASON_META } from "../utils/reasonMeta";
import type { SpoilageByReasonRow } from "../hooks/useSpoilageReport";

interface Props {
  data: SpoilageByReasonRow[];
}

export function SpoilageReasonDonut({ data }: Props) {
  const totalCost = data.reduce((sum, row) => sum + row.cost, 0);

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-ink-faint">Losses by reason</p>
      {totalCost <= 0 ? (
        <p className="py-10 text-center text-xs text-ink-faint">
          Cost data unavailable — set a product cost or link purchase history to price losses.
        </p>
      ) : (
        <div className="flex items-center gap-2">
          <div className="relative h-40 w-40 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="cost"
                  nameKey="reason"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {data.map((row) => (
                    <Cell key={row.reason} fill={REASON_META[row.reason].color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrencyCompact(Number(value))}
                  contentStyle={{ borderRadius: 12, border: "1px solid var(--color-line)", fontSize: 13 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-lg font-bold text-ink">{formatCurrencyCompact(totalCost)}</p>
              <p className="text-[10px] text-ink-faint">total lost</p>
            </div>
          </div>
          <ul className="min-w-0 flex-1 space-y-1.5">
            {data.map((row) => {
              const share = totalCost > 0 ? (row.cost / totalCost) * 100 : 0;
              return (
                <li key={row.reason} className="flex items-center justify-between gap-2 text-xs">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: REASON_META[row.reason].color }}
                    />
                    <span className="truncate text-ink">{REASON_META[row.reason].label}</span>
                  </span>
                  <span className="shrink-0 font-medium text-ink-soft">
                    {share.toFixed(0)}%
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
