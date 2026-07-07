import { useState } from "react";
import { Pencil, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/utils/currency";
import { useProducts } from "../hooks/useProducts";
import { ProductForm } from "./ProductForm";
import type { Product } from "../types";

export function ProductList() {
  const { data: products = [], isLoading } = useProducts();
  const [editing, setEditing] = useState<Product | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line py-14 text-center">
        <Package className="mb-2 h-8 w-8 text-ink-faint" />
        <p className="text-sm font-medium text-ink">No products yet</p>
        <p className="text-xs text-ink-faint">Add your first product to start tracking sales.</p>
      </div>
    );
  }

  return (
    <>
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit product</DialogTitle>
          </DialogHeader>
          {editing && <ProductForm initial={editing} onDone={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>

      <div className="divide-y divide-line rounded-xl border border-line">
        {products.map((product) => (
          <div key={product.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="truncate font-medium text-ink">{product.name}</span>
              <Badge variant="neutral" className="shrink-0 text-[10px]">
                {product.unit}
              </Badge>
              {!product.isActive && (
                <Badge variant="neutral" className="shrink-0 text-[10px]">
                  Inactive
                </Badge>
              )}
            </div>
            <span className="shrink-0 font-semibold text-ink">{formatCurrency(product.defaultPrice)}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-ink-faint hover:text-primary"
              onClick={() => setEditing(product)}
              aria-label={`Edit ${product.name}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
