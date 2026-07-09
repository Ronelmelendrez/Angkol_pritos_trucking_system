import { useMemo } from "react";
import { AlertTriangle, Package } from "lucide-react";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useExpenses } from "@/features/expenses/hooks/useExpenses";
import { useSales } from "@/features/sales/hooks/useSales";
import { adjustmentsTable } from "@/lib/mockData";
import { buildLedger } from "../utils/buildLedger";
import { todayISO } from "@/utils/date";

interface Props {
  threshold?: number;
}

export function LowStockBanner({ threshold = 5 }: Props) {
  const { data: products = [] } = useProducts();
  const { data: expenses = [] } = useExpenses();
  const { data: sales = [] } = useSales();
  const adjustments = adjustmentsTable.list();
  const today = todayISO();

  const lowStockItems = useMemo(() => {
    const active = products.filter((p) => p.isActive);
    return active
      .map((p) => {
        const entries = buildLedger(p.id, [today], expenses, sales, adjustments);
        const qty = entries[entries.length - 1]?.closingQty ?? 0;
        return { product: p, qty };
      })
      .filter(({ qty }) => qty >= 0 && qty <= threshold);
  }, [products, today, expenses, sales, adjustments, threshold]);

  if (lowStockItems.length === 0) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning-bg/30 px-4 py-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warning/20 text-warning">
        <AlertTriangle className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink">Stock running low</p>
        <ul className="mt-1 space-y-0.5">
          {lowStockItems.map(({ product, qty }) => (
            <li key={product.id} className="flex items-center gap-1.5 text-xs text-ink-soft">
              <Package className="h-3 w-3" />
              {product.name} — {qty} {product.unit} left
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
