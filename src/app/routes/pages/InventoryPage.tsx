import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import type { DatePreset } from "@/components/ui/DatePresets";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useInventoryLedger } from "@/features/inventory/hooks/useInventoryLedger";
import { InventoryLedgerTable } from "@/features/inventory/components/InventoryLedgerTable";
import { InventoryFilters } from "@/features/inventory/components/InventoryFilters";
import { InventoryOverviewTab } from "@/features/inventory/components/InventoryOverviewTab";
import { InventoryAdjustmentsTab } from "@/features/inventory/components/InventoryAdjustmentsTab";
import { LowStockTab } from "@/features/inventory/components/LowStockTab";
import { InventoryReportsTab } from "@/features/inventory/components/InventoryReportsTab";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { startOfWeek } from "date-fns/startOfWeek";
import { endOfWeek } from "date-fns/endOfWeek";

export function InventoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "overview";
  const setTab = (v: string) => setSearchParams((prev) => { prev.set("tab", v); return prev; });

  const { data: products = [] } = useProducts();
  const activeProducts = products.filter((p) => p.isActive);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [datePreset, setDatePreset] = useState<DatePreset>("this-month");
  const [customFrom, setCustomFrom] = useState(format(new Date(), "yyyy-MM-dd"));
  const [customTo, setCustomTo] = useState(format(new Date(), "yyyy-MM-dd"));

  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");

  const dateFrom =
    datePreset === "today" ? todayStr
    : datePreset === "this-week" ? format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd")
    : datePreset === "this-month" ? format(startOfMonth(today), "yyyy-MM-dd")
    : customFrom;

  const dateTo =
    datePreset === "today" ? todayStr
    : datePreset === "this-week" ? format(endOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd")
    : datePreset === "this-month" ? format(endOfMonth(today), "yyyy-MM-dd")
    : customTo;

  const dateRange: string[] = [];
  const cursor = new Date(dateFrom);
  while (cursor <= new Date(dateTo)) {
    dateRange.push(format(cursor, "yyyy-MM-dd"));
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
          <div className="border-b border-line px-4 pt-2">
            <TabsList className="mb-2 max-w-full overflow-x-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="ledger">Ledger</TabsTrigger>
              <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
              <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
          </div>

          {/* Filters shown for Ledger, Reports, and Adjustments tabs */}
          {(tab === "ledger" || tab === "reports" || tab === "adjustments") && (
            <InventoryFilters
              selectedProductId={selectedProductId}
              onProductChange={setSelectedProductId}
              datePreset={datePreset}
              onDatePresetChange={setDatePreset}
              customFrom={customFrom}
              customTo={customTo}
              onCustomFromChange={setCustomFrom}
              onCustomToChange={setCustomTo}
              showProduct={tab !== "adjustments"}
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
              <InventoryAdjustmentsTab dateRange={dateRange} />
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
