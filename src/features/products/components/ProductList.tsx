import { useState } from "react";
import { Pencil, Package, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/AlertDialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/utils/currency";
import { useProducts, useDeleteProduct } from "../hooks/useProducts";
import { useToast } from "@/components/ui/useToast";
import { ProductForm } from "./ProductForm";
import type { Product } from "../types";

const PAGE_SIZE = 10;

export function ProductList() {
  const { data: products = [], isLoading } = useProducts();
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [page, setPage] = useState(1);
  const deleteProduct = useDeleteProduct();
  const { toast } = useToast();

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = products.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteProduct.mutateAsync(deleteTarget.id);
      toast({ title: "Product deleted", description: deleteTarget.name, variant: "success" });
    } catch {
      toast({ title: "Couldn't delete product", variant: "error" });
    } finally {
      setDeleteTarget(null);
    }
  }

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
        {pageItems.map((product) => (
          <div key={product.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="truncate font-medium text-ink">{product.name}</span>
              <Badge variant="neutral" className="shrink-0 text-[10px]">
                {product.unit}
              </Badge>
              {product.reorderThreshold !== undefined && (
                <Badge variant="neutral" className="shrink-0 text-[10px]">
                  Min {product.reorderThreshold}
                </Badge>
              )}
              {!product.isActive && (
                <Badge variant="neutral" className="shrink-0 text-[10px]">
                  Inactive
                </Badge>
              )}
            </div>
            <span className="shrink-0 font-semibold text-ink">{formatCurrency(product.defaultPrice)}</span>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-ink-faint hover:text-primary"
                onClick={() => setEditing(product)}
                aria-label={`Edit ${product.name}`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-ink-faint hover:text-danger"
                onClick={() => setDeleteTarget(product)}
                aria-label={`Delete ${product.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product</AlertDialogTitle>
            <AlertDialogDescription>
              Delete <span className="font-medium text-ink">{deleteTarget?.name}</span> from the catalog? Its sales and
              stock adjustments across the system will also be removed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
