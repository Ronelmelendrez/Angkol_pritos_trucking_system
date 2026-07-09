import { useState } from "react";
import { ClipboardList, Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useInventoryLedger } from "@/features/inventory/hooks/useInventoryLedger";
import { InventoryLedgerTable } from "@/features/inventory/components/InventoryLedgerTable";
import { StockAdjustmentForm } from "@/features/inventory/components/StockAdjustmentForm";
import { formatCurrency } from "@/utils/currency";
import { subDays, format as formatDateFns } from "date-fns";

export function InventoryPage() {
  const { data: products = [] } = useProducts();
  const activeProducts = products.filter((p) => p.isActive);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);

  const today = formatDateFns(new Date(), "yyyy-MM-dd");
  const thirtyDaysAgo = formatDateFns(subDays(new Date(), 29), "yyyy-MM-dd");
  const dateRange: string[] = [];
  const cursor = new Date(thirtyDaysAgo);
  while (cursor <= new Date(today)) {
    dateRange.push(formatDateFns(cursor, "yyyy-MM-dd"));
    cursor.setDate(cursor.getDate() + 1);
  }

  const selectedProduct = activeProducts.find((p) => p.id === selectedProductId);
  const entries = useInventoryLedger(selectedProductId, dateRange);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Inventory ledger</CardTitle>
            <CardDescription>Daily stock movement per product</CardDescription>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <div className="p-4">
          <Label htmlFor="inv-product">Product</Label>
          <div className="mt-1 flex items-end gap-3">
            <div className="flex-1">
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger id="inv-product">
                  <SelectValue placeholder="Choose a product to view ledger" />
                </SelectTrigger>
                <SelectContent>
                  {activeProducts.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} — {formatCurrency(p.defaultPrice)}/{p.unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedProductId && (
              <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="h-4 w-4" /> Adjust stock
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Stock adjustment</DialogTitle>
                  </DialogHeader>
                  {selectedProduct && (
                    <StockAdjustmentForm
                      productId={selectedProductId}
                      onDone={() => setAdjustDialogOpen(false)}
                    />
                  )}
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {selectedProductId && selectedProduct ? (
          <div className="px-4 pb-4">
            <div className="mb-4 flex items-center gap-2 text-sm text-ink-faint">
              <ClipboardList className="h-4 w-4" />
              Showing last 30 days of <span className="font-medium text-ink">{selectedProduct.name}</span>
            </div>
            <InventoryLedgerTable entries={entries} unit={selectedProduct.unit} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <ClipboardList className="mb-2 h-8 w-8 text-ink-faint" />
            <p className="text-sm font-medium text-ink">Select a product</p>
            <p className="text-xs text-ink-faint">Choose a product above to view its daily stock ledger.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
