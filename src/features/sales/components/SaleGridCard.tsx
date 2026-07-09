import { useMemo } from "react";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { useDeleteSale } from "../hooks/useSales";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useToast } from "@/components/ui/useToast";
import type { Sale } from "../types";

interface Props {
  sale: Sale;
}

export function SaleGridCard({ sale }: Props) {
  const deleteSale = useDeleteSale();
  const { data: products = [] } = useProducts();
  const { toast } = useToast();

  const productName = useMemo(() => {
    return products.find((p) => p.id === sale.productId)?.name ?? "Unknown";
  }, [products, sale.productId]);

  async function handleDelete() {
    try {
      await deleteSale.mutateAsync(sale.id);
      toast({ title: "Sale removed", variant: "default" });
    } catch {
      toast({ title: "Couldn't remove sale", variant: "error" });
    }
  }

  return (
    <div className="ticket ticket-perf flex flex-col gap-2 p-4">
      <div className="flex items-start justify-between gap-2">
        <Badge variant="neutral" className="shrink-0">
          {productName}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-ink-faint hover:text-danger"
          onClick={handleDelete}
          aria-label="Delete sale"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <p className="text-lg font-bold text-ink">{formatCurrency(sale.amount)}</p>

      <p className="text-sm text-ink">
        {sale.quantitySold} × {formatCurrency(sale.unitPrice)}
      </p>

      <div className="mt-auto flex items-center justify-between text-xs text-ink-faint">
        <span>{formatDate(sale.date)}</span>
        {sale.notes && <span className="truncate">{sale.notes}</span>}
      </div>
    </div>
  );
}
