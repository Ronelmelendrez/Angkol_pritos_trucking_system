import { Skeleton } from "@/components/ui/Skeleton";
import { useInventoryLedger } from "../hooks/useInventoryLedger";
import { todayISO } from "@/utils/date";

interface Props {
  productId: string;
  productName: string;
  unit: string;
}

export function ProductStockCard({ productId, productName, unit }: Props) {
  const dateRange = [todayISO()];
  const entries = useInventoryLedger(productId, dateRange);
  const currentEntry = entries[entries.length - 1];

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
    <div className="rounded-lg border border-line bg-surface px-4 py-3">
      <p className="text-xs text-ink-faint">{productName}</p>
      <p
        className={`mt-0.5 text-lg font-bold ${
          isOut ? "text-danger" : isLow ? "text-warning" : "text-ink"
        }`}
      >
        {currentEntry.closingQty}{" "}
        <span className="text-sm font-normal text-ink-faint">{unit}</span>
      </p>
      <p className="text-xs text-ink-faint">
        {isOut
          ? "Out of stock"
          : isLow
            ? "Low stock"
            : "On hand"}
      </p>
    </div>
  );
}
