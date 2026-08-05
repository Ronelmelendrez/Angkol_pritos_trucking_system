import { useState } from "react";
import { ArrowUpDown, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAllProductStock } from "../hooks/useAllProductStock";
import { useAdjustmentFlags } from "../hooks/useAdjustmentFlags";
import { StockAdjustmentDialog } from "./StockAdjustmentDialog";
import { formatQty } from "@/utils/currency";

interface Props {
  productId: string;
  productName: string;
  unit: string;
}

export function ProductStockCard({ productId, productName, unit }: Props) {
  const stockData = useAllProductStock();
  const stock = stockData.find((s) => s.productId === productId);
  const adjustmentFlags = useAdjustmentFlags();
  const adjustmentFlagged = adjustmentFlags[productId];
  const [adjustOpen, setAdjustOpen] = useState(false);

  if (!stock) {
    return (
      <div className="rounded-lg border border-line bg-surface px-4 py-3">
        <p className="text-xs text-ink-faint">{productName}</p>
        <Skeleton className="mt-1 h-5 w-20" />
      </div>
    );
  }

  const closingQty = stock.closingQty;
  const isLow = closingQty > 0 && closingQty <= 5;
  const isOut = closingQty <= 0;

  return (
    <>
      <StockAdjustmentDialog
        open={adjustOpen}
        onOpenChange={setAdjustOpen}
        initialProductId={productId}
      />
      <div className="group relative rounded-lg border border-line bg-surface px-4 py-3">
        <p className="text-xs text-ink-faint">{productName}</p>
        <p
          className={`mt-0.5 text-lg font-bold ${
            isOut ? "text-danger" : isLow ? "text-warning" : "text-ink"
          }`}
        >
          {formatQty(closingQty)}{" "}
          <span className="text-sm font-normal text-ink-faint">{unit}</span>
        </p>
        <div className="mt-1 flex items-center justify-between">
          <p className="flex items-center gap-1 text-xs font-medium">
            {isOut ? (
              <span className="text-danger">Out of stock</span>
            ) : isLow ? (
              <span className="text-warning">Low stock</span>
            ) : (
              <span className="text-success">On hand</span>
            )}
            {adjustmentFlagged && (
              <span
                title="Stock loss rate is above this product's historical average"
                className="text-warning"
              >
                <AlertTriangle className="h-3 w-3" />
              </span>
            )}
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100"
            onClick={() => setAdjustOpen(true)}
            aria-label={`Adjust stock for ${productName}`}
          >
            <ArrowUpDown className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </>
  );
}
