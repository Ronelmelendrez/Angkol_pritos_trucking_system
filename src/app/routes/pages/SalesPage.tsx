import { useState, useMemo, useCallback } from "react";
import { Plus } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { startOfWeek } from "date-fns/startOfWeek";
import { endOfWeek } from "date-fns/endOfWeek";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { SalesList } from "@/features/sales/components/SalesList";
import { SaleGridCard } from "@/features/sales/components/SaleGridCard";
import { SaleForm } from "@/features/sales/components/SaleForm";
import { SalesFiltersBar, SalesDatePresets } from "@/features/sales/components/SalesFilters";
import type { DatePreset } from "@/features/sales/components/SalesFilters";
import { useSales } from "@/features/sales/hooks/useSales";
import { TransactionViewTabs } from "@/components/layout/TransactionViewTabs";
import { useProducts } from "@/features/products/hooks/useProducts";
import { formatCurrency } from "@/utils/currency";
import type { Sale } from "@/features/sales/types";

const PRODUCT_PALETTE = [
  "#E67E22", "#C0392B", "#2ECC71", "#3498DB",
  "#9B59B6", "#1ABC9C", "#E74C3C", "#F39C12",
  "#2980B9", "#8E44AD", "#16A085", "#D35400",
];

export function SalesPage() {
  const { data: sales = [] } = useSales();
  const { data: products = [] } = useProducts();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState("All");
  const [datePreset, setDatePreset] = useState<DatePreset>("this-month");
  const [customFrom, setCustomFrom] = useState(format(new Date(), "yyyy-MM-dd"));
  const [customTo, setCustomTo] = useState(format(new Date(), "yyyy-MM-dd"));

  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");

  const dateFrom = useMemo(() => {
    switch (datePreset) {
      case "today": return todayStr;
      case "this-week": return format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
      case "this-month": return format(startOfMonth(today), "yyyy-MM-dd");
      case "custom": return customFrom;
    }
  }, [datePreset, customFrom, todayStr]);

  const dateTo = useMemo(() => {
    switch (datePreset) {
      case "today": return todayStr;
      case "this-week": return format(endOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
      case "this-month": return format(endOfMonth(today), "yyyy-MM-dd");
      case "custom": return customTo;
    }
  }, [datePreset, customTo, todayStr]);

  const productMap = useMemo(() => {
    return new Map(products.map((p) => [p.id, p]));
  }, [products]);

  const filtered = useMemo(() => {
    return sales.filter((s) => {
      if (dateFrom && s.date < dateFrom) return false;
      if (dateTo && s.date > dateTo) return false;
      if (productFilter !== "All" && s.productId !== productFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const product = productMap.get(s.productId);
        if (product && !product.name.toLowerCase().includes(q)) return false;
        if (!product && !s.notes?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [sales, dateFrom, dateTo, productFilter, search, productMap]);

  const totalSales = filtered.reduce((sum, s) => sum + s.amount, 0);

  const productColors = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p, i) => map.set(p.id, PRODUCT_PALETTE[i % PRODUCT_PALETTE.length]));
    return map;
  }, [products]);

  const renderTable = useCallback(
    (data: Sale[]) => <SalesList sales={data} />,
    [],
  );

  const renderGridCard = useCallback(
    (sale: Sale) => <SaleGridCard sale={sale} />,
    [],
  );

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Sales tracking</CardTitle>
            <CardDescription>
              {filtered.length} sale{filtered.length === 1 ? "" : "s"} · Total{" "}
              <span className="font-semibold text-ink">{formatCurrency(totalSales)}</span>
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" /> Record sale
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log a new sale</DialogTitle>
              </DialogHeader>
              <SaleForm onDone={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </CardHeader>

        <div className="mb-4">
          <SalesFiltersBar
            search={search}
            onSearchChange={setSearch}
            productFilter={productFilter}
            onProductChange={setProductFilter}
            products={products}
          />
        </div>

        <TransactionViewTabs
          data={filtered}
          isLoading={false}
          getDate={(s) => s.date}
          getAmount={(s) => s.amount}
          renderTable={renderTable}
          renderGridCard={renderGridCard}
          groupedTabLabel="By Product"
          getGroupKey={(s) => s.productId}
          getGroupLabel={(key) => productMap.get(key)?.name ?? "Unknown"}
          getGroupColor={(key) => productColors.get(key) ?? "#888"}
          emptyMessage="No sales match these filters"
          filters={
            <SalesDatePresets
              datePreset={datePreset}
              onPresetChange={setDatePreset}
              customFrom={customFrom}
              customTo={customTo}
              onCustomFromChange={setCustomFrom}
              onCustomToChange={setCustomTo}
            />
          }
        />
      </Card>
    </div>
  );
}
