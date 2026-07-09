import { useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { Download } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";
import { useInventoryLedger } from "../hooks/useInventoryLedger";

interface Props {
  productId: string;
  dateRange: string[];
}

export function InventoryReportsTab({ productId, dateRange }: Props) {
  const entries = useInventoryLedger(productId, dateRange);

  const chartData = useMemo(
    () =>
      entries.map((e) => ({
        label: format(new Date(e.date), "MMM d"),
        closing: e.closingQty,
        purchased: e.purchasedQty,
        sold: e.soldQty,
      })),
    [entries],
  );

  function handleExportCsv() {
    const headers = ["Date,Opening,Purchased,Sold,Adjustment,Closing"];
    const rows = entries.map(
      (e) => `${e.date},${e.openingQty},${e.purchasedQty},${e.soldQty},${e.adjustmentQty},${e.closingQty}`,
    );
    const csv = [...headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-ledger-${productId}-${dateRange[0]}-to-${dateRange[dateRange.length - 1]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-faint">
          {chartData.length} day{chartData.length === 1 ? "" : "s"} of data
        </p>
        <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={entries.length === 0}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="h-64">
        <p className="mb-2 text-xs font-medium text-ink-faint">Stock level trend</p>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ left: -10, right: 10, top: 5, bottom: 0 }}>
            <defs>
              <linearGradient id="closingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F1C40F" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#F1C40F" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }} axisLine={{ stroke: "var(--color-line)" }} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }} axisLine={false} tickLine={false} width={40} />
            <Tooltip
              formatter={(value) => Number(value).toFixed(1)}
              contentStyle={{ borderRadius: 12, border: "1px solid var(--color-line)", fontSize: 13 }}
            />
            <Area type="monotone" dataKey="closing" name="Closing stock" stroke="#F1C40F" strokeWidth={2} fill="url(#closingGradient)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="h-64">
        <p className="mb-2 text-xs font-medium text-ink-faint">Purchased vs sold volume</p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ left: -10, right: 10, top: 5, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }} axisLine={{ stroke: "var(--color-line)" }} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }} axisLine={false} tickLine={false} width={40} />
            <Tooltip
              formatter={(value) => Number(value).toFixed(1)}
              contentStyle={{ borderRadius: 12, border: "1px solid var(--color-line)", fontSize: 13 }}
            />
            <Legend verticalAlign="top" height={28} iconType="circle" iconSize={8} />
            <Bar dataKey="purchased" name="Purchased" fill="#E67E22" radius={[3, 3, 0, 0]} />
            <Bar dataKey="sold" name="Sold" fill="#C0392B" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
