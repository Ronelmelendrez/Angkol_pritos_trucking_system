import { useState, useMemo } from "react";
import { Trash2, ShoppingCart, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { cn } from "@/utils/cn";
import { useDeleteSale } from "../hooks/useSales";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useToast } from "@/components/ui/useToast";
import type { Sale } from "../types";

interface Props {
  sales: Sale[];
}

export function SalesList({ sales }: Props) {
  const { data: products = [] } = useProducts();
  const deleteSale = useDeleteSale();
  const { toast } = useToast();

  const productMap = useMemo(() => {
    const map = new Map(products.map((p) => [p.id, p]));
    return map;
  }, [products]);

  const groups = useMemo(() => {
    const map = new Map<string, Sale[]>();
    for (const sale of sales) {
      const list = map.get(sale.date) ?? [];
      list.push(sale);
      map.set(sale.date, list);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [sales]);

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  function toggle(date: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  }

  async function handleDelete(id: string) {
    try {
      await deleteSale.mutateAsync(id);
      toast({ title: "Sale removed", variant: "default" });
    } catch {
      toast({ title: "Couldn't remove sale", variant: "error" });
    }
  }

  if (sales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line py-14 text-center">
        <ShoppingCart className="mb-2 h-8 w-8 text-ink-faint" />
        <p className="text-sm font-medium text-ink">No sales logged yet</p>
        <p className="text-xs text-ink-faint">Log your first sale to start tracking revenue.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map(([date, items]) => {
        const isOpen = !collapsed.has(date);
        const dayTotal = items.reduce((sum, s) => sum + s.amount, 0);

        return (
          <div key={date} className="overflow-hidden rounded-xl border border-line bg-surface">
            <button
              type="button"
              onClick={() => toggle(date)}
              className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition-colors hover:bg-primary/[0.03]"
            >
              <div className="flex items-center gap-3">
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-ink-faint transition-transform",
                    !isOpen && "-rotate-90",
                  )}
                />
                <span className="stamp text-base font-semibold text-ink">{formatDate(date)}</span>
                <span className="text-sm text-ink-soft">
                  {items.length} sale{items.length === 1 ? "" : "s"}
                </span>
              </div>
              <span className="font-semibold text-ink">{formatCurrency(dayTotal)}</span>
            </button>

            {isOpen && (
              <div className="divide-y divide-dashed divide-line border-t border-line">
                {items.map((sale) => {
                  const product = sale.productId ? productMap.get(sale.productId) : undefined;
                  return (
                    <div
                      key={sale.id}
                      className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm hover:bg-primary/[0.02]"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        {product && (
                          <Badge variant="neutral" className="shrink-0 text-[10px]">
                            {product.name}
                          </Badge>
                        )}
                        <span className="text-xs text-ink-faint">
                          {sale.quantitySold} × {formatCurrency(sale.unitPrice)}
                        </span>
                        {sale.notes && (
                          <span className="hidden sm:inline truncate text-ink-faint">· {sale.notes}</span>
                        )}
                      </div>
                      <span className="shrink-0 font-semibold text-ink">{formatCurrency(sale.amount)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-ink-faint hover:text-danger"
                        onClick={() => handleDelete(sale.id)}
                        aria-label="Delete sale"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
