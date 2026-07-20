import { useMemo } from "react";
import { Package, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAllProductStock } from "../hooks/useAllProductStock";
import { usePayRuleSettings } from "@/features/settings/hooks/usePayRuleSettings";
import { formatQty } from "@/utils/currency";

export function LowStockTab() {
  const stockData = useAllProductStock();
  const { data: settings } = usePayRuleSettings();
  const globalThreshold = settings?.defaultReorderThreshold ?? 5;

  const lowItems = useMemo(() => {
    return stockData
      .filter((item) => item.closingQty >= 0 && item.closingQty <= globalThreshold)
      .sort((a, b) => a.closingQty - b.closingQty);
  }, [stockData, globalThreshold]);

  if (lowItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <Package className="mb-2 h-8 w-8 text-success" />
        <p className="text-sm font-medium text-ink">All stock levels look healthy</p>
        <p className="text-xs text-ink-faint">
          No products are below the reorder threshold ({globalThreshold}).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-faint">
        {lowItems.length} product{lowItems.length === 1 ? "" : "s"} below reorder threshold ({globalThreshold})
      </p>
      <div className="overflow-hidden rounded-xl border border-line">
        <table className="w-full text-sm">
          <thead className="bg-ink/[0.03] text-left text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 text-right font-medium">Current stock</th>
              <th className="px-4 py-3 text-right font-medium">Sold today</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {lowItems.map((item) => (
              <tr key={item.productId} className="bg-surface hover:bg-primary/[0.03]">
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2 font-medium text-ink">
                    <TrendingDown className="h-4 w-4 text-danger" />
                    {item.productName}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-danger">
                  {formatQty(item.closingQty)} {item.unit}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-ink-soft">{formatQty(item.soldQty)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
