import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useInventoryLedger } from "../hooks/useInventoryLedger";
import { StockAdjustmentDialog } from "./StockAdjustmentDialog";
import { todayISO } from "@/utils/date";
import { formatQty } from "@/utils/currency";

interface Props {
  productId: string;
  productName: string;
  unit: string;
}

export function ProductStockCard({ productId, productName, unit }: Props) {
  const dateRange = [todayISO()];
  const entries = useInventoryLedger(productId, dateRange);
  const currentEntry = entries[entries.length - 1];
  const [adjustOpen, setAdjustOpen] = useState(false);

  if (!currentEntry) {
    return (
      <div className="rounded-lg border border-line bg-surface px-4 py-3">
        <p className="text-xs text-ink-faint">{productName}</p>
        <Skeleton className="mt-1 h-5 w-20" />
      </div>
    );
  }

  const isLow = currentEntry.closingQty > 0 && currentEntry.closingQty <= 5;
  const isOut = currentEntry.closingQty <= 0;

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
          {formatQty(currentEntry.closingQty)}{" "}
          <span className="text-sm font-normal text-ink-faint">{unit}</span>
        </p>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-xs text-ink-faint">
            {isOut
              ? "Out of stock"
              : isLow
                ? "Low stock"
                : "On hand"}
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
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
