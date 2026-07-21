import { useState } from "react";
import { Package, Pencil, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAllProductStock, type ProductStockInfo } from "../hooks/useAllProductStock";
import { EditStockDialog } from "./EditStockDialog";
import { StockAdjustmentDialog } from "./StockAdjustmentDialog";
import { formatQty } from "@/utils/currency";

export function InventoryOverviewTab() {
  const stockData = useAllProductStock();

  if (stockData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <Package className="mb-2 h-8 w-8 text-ink-faint" />
        <p className="text-sm font-medium text-ink">No products yet</p>
        <p className="text-xs text-ink-faint">Add a product to start tracking stock.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {stockData.map((item) => (
        <ProductOverviewCard key={item.productId} item={item} />
      ))}
    </div>
  );
}

function ProductOverviewCard({ item }: { item: ProductStockInfo }) {
  const isNegative = item.closingQty < 0;
  const isLow = !isNegative && item.closingQty <= 5;

  const [editOpen, setEditOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);

  return (
    <>
      <EditStockDialog open={editOpen} onOpenChange={setEditOpen} productId={item.productId} />
      <StockAdjustmentDialog open={adjustOpen} onOpenChange={setAdjustOpen} initialProductId={item.productId} />
      <div className="group relative rounded-xl border border-line bg-surface p-4 transition-shadow hover:shadow-sm">
        <p className="text-sm font-medium text-ink">{item.productName}</p>
        <p
          className={`mt-1 text-2xl font-bold ${
            isNegative ? "text-danger" : isLow ? "text-warning" : "text-success"
          }`}
        >
          {formatQty(item.closingQty)}{" "}
          <span className="text-sm font-normal text-ink-faint">{item.unit}</span>
        </p>
        <div className="mt-2 flex items-center gap-3 text-xs text-ink-faint">
          <span className={item.purchasedQty > 0 ? "text-success" : ""}>
            +{formatQty(item.purchasedQty)} today
          </span>
          <span className={item.soldQty > 0 ? "text-danger" : ""}>
            -{formatQty(item.soldQty)} sold
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-xs font-medium">
            {isNegative ? (
              <span className="text-danger">Oversold — stock is negative</span>
            ) : isLow ? (
              <span className="text-warning">Low stock</span>
            ) : (
              <span className="text-success">Healthy</span>
            )}
          </p>
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-ink-faint hover:text-primary"
              onClick={() => setEditOpen(true)}
              aria-label={`Edit stock for ${item.productName}`}
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-ink-faint hover:text-primary"
              onClick={() => setAdjustOpen(true)}
              aria-label={`Adjust stock for ${item.productName}`}
            >
              <ArrowUpDown className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
