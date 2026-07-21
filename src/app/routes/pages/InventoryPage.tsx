import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useInventoryLedger } from "@/features/inventory/hooks/useInventoryLedger";
import { InventoryLedgerTable } from "@/features/inventory/components/InventoryLedgerTable";
import { InventoryFilters } from "@/features/inventory/components/InventoryFilters";
import { InventoryOverviewTab } from "@/features/inventory/components/InventoryOverviewTab";
import { InventoryAdjustmentsTab } from "@/features/inventory/components/InventoryAdjustmentsTab";
import { LowStockTab } from "@/features/inventory/components/LowStockTab";
import { InventoryReportsTab } from "@/features/inventory/components/InventoryReportsTab";
import { subDays, format as formatDateFns } from "date-fns";

const RANGE_PRESETS = { "7d": 6, "14d": 13, "30d": 29 } as const;

export function InventoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "overview";
  const setTab = (v: string) => setSearchParams((prev) => { prev.set("tab", v); return prev; });

  const { data: products = [] } = useProducts();
  const activeProducts = products.filter((p) => p.isActive);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [rangePreset, setRangePreset] = useState<keyof typeof RANGE_PRESETS>("30d");

  const today = formatDateFns(new Date(), "yyyy-MM-dd");
  const daysBack = RANGE_PRESETS[rangePreset];
  const dateFrom = formatDateFns(subDays(new Date(), daysBack), "yyyy-MM-dd");

  const dateRange: string[] = [];
  const cursor = new Date(dateFrom);
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
            <CardTitle>Inventory</CardTitle>
            <CardDescription>Daily stock movement, adjustments, and reports</CardDescription>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <Tabs value={tab} onValueChange={setTab}>
          <div className="flex items-center justify-between border-b border-line px-4 pt-2">
            <TabsList className="mb-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="ledger">Ledger</TabsTrigger>
              <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
              <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
          </div>

          {/* Filters shown only for Ledger and Reports tabs */}
          {(tab === "ledger" || tab === "reports") && (
            <InventoryFilters
              selectedProductId={selectedProductId}
              onProductChange={setSelectedProductId}
              rangePreset={rangePreset}
              onDateRangeChange={setRangePreset}
            />
          )}

          <TabsContent value="overview">
            <div className="px-4 pb-4">
              <InventoryOverviewTab />
            </div>
          </TabsContent>

          <TabsContent value="ledger">
            <div className="px-4 pb-4">
              {selectedProductId && selectedProduct ? (
                <div>
                  <div className="mb-4 flex items-center gap-2 text-sm text-ink-faint">
                    <ClipboardList className="h-4 w-4" />
                    Last 30 days of <span className="font-medium text-ink">{selectedProduct.name}</span>
                  </div>
                  <InventoryLedgerTable entries={entries} unit={selectedProduct.unit} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <ClipboardList className="mb-2 h-8 w-8 text-ink-faint" />
                  <p className="text-sm font-medium text-ink">Select a product</p>
                  <p className="text-xs text-ink-faint">Use the filter above to choose a product.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="adjustments">
            <div className="px-4 pb-4">
              <InventoryAdjustmentsTab />
            </div>
          </TabsContent>

          <TabsContent value="low-stock">
            <div className="px-4 pb-4">
              <LowStockTab />
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="px-4 pb-4">
              {selectedProductId ? (
                <InventoryReportsTab productId={selectedProductId} dateRange={dateRange} />
              ) : (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <ClipboardList className="mb-2 h-8 w-8 text-ink-faint" />
                  <p className="text-sm font-medium text-ink">Select a product</p>
                  <p className="text-xs text-ink-faint">Use the filter above to view reports.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
