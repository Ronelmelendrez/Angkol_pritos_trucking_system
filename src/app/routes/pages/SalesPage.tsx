import { useState, useMemo, useCallback } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { SalesList } from "@/features/sales/components/SalesList";
import { SaleGridCard } from "@/features/sales/components/SaleGridCard";
import { SaleForm } from "@/features/sales/components/SaleForm";
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

  const productMap = useMemo(() => {
    return new Map(products.map((p) => [p.id, p]));
  }, [products]);

  const filtered = useMemo(() => {
    return sales.filter((s) => {
      if (productFilter !== "All" && s.productId !== productFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const product = productMap.get(s.productId);
        if (product && !product.name.toLowerCase().includes(q)) return false;
        if (!product && !s.notes?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [sales, productFilter, search, productMap]);

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

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <Input
              placeholder="Search products..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={productFilter} onValueChange={setProductFilter}>
            <SelectTrigger className="sm:w-44">
              <SelectValue placeholder="Product" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All products</SelectItem>
              {products.filter((p) => p.isActive).map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        />
      </Card>
    </div>
  );
}
