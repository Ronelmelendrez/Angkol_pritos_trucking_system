import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { formatCurrencyCompact, formatQty } from "@/utils/currency";
import { REASON_META } from "../utils/reasonMeta";
import type { AdjustmentByReasonRow } from "../hooks/useAdjustmentReport";

interface Props {
  data: AdjustmentByReasonRow[];
}

export function AdjustmentReasonDonut({ data }: Props) {
  const totalCost = data.reduce((sum, row) => sum + row.cost, 0);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Losses by reason</CardTitle>
          <CardDescription>Share of total value lost</CardDescription>
        </div>
      </CardHeader>
      {totalCost <= 0 ? (
        <p className="py-10 text-center text-sm text-ink-faint">
          Cost data unavailable — set a product cost or link purchase history to price losses.
        </p>
      ) : (
        <div className="flex flex-col items-center gap-3 pb-2 sm:flex-row sm:items-center sm:gap-4">
          <div className="relative mx-auto h-40 w-40 shrink-0 sm:mx-0">
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
          <ul className="w-full min-w-0 flex-1 space-y-1.5">
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
                    {row.qtyFound > 0 && (
                      <span className="shrink-0 text-[10px] font-medium text-success">
                        +{formatQty(row.qtyFound)} found
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 font-medium text-ink-soft">
                    {row.qtyLost > 0 && row.cost === 0 ? `${formatQty(row.qtyLost)} lost` : `${share.toFixed(0)}%`}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Card>
  );
}
