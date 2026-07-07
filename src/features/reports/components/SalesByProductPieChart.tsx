import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { formatCurrency } from "@/utils/currency";
import { useProducts } from "@/features/products/hooks/useProducts";
import type { Sale } from "@/features/sales/types";

const PIE_COLORS = [
  "#F1C40F", "#E67E22", "#2ECC71", "#3498DB", "#9B59B6",
  "#1ABC9C", "#E74C3C", "#34495E", "#16A085", "#F39C12",
];

export function SalesByProductPieChart({ sales }: { sales: Sale[] }) {
  const { data: products = [] } = useProducts();

  const data = useMemo(() => {
    const totals = new Map<string, number>();
    sales.forEach((s) => totals.set(s.productId, (totals.get(s.productId) ?? 0) + s.amount));
    const productMap = new Map(products.map((p) => [p.id, p]));
    return Array.from(totals.entries())
      .map(([productId, total]) => ({
        name: productMap.get(productId)?.name ?? "Unknown",
        value: total,
      }))
      .sort((a, b) => b.value - a.value);
  }, [sales, products]);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Sales breakdown</CardTitle>
          <CardDescription>By product</CardDescription>
        </div>
      </CardHeader>
      {data.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-faint">No sales yet.</p>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
              >
                {data.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} stroke="var(--color-surface)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(Number(value ?? 0))}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--color-line)",
                  fontSize: 13,
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={48}
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-xs text-ink-soft">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
      {total > 0 && (
        <p className="mt-1 text-center text-sm text-ink-soft">
          Total: <span className="font-semibold text-ink">{formatCurrency(total)}</span>
        </p>
      )}
    </Card>
  );
}
