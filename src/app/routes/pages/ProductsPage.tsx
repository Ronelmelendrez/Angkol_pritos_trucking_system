import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { ProductList } from "@/features/products/components/ProductList";
import { ProductForm } from "@/features/products/components/ProductForm";
import { useProducts } from "@/features/products/hooks/useProducts";

export function ProductsPage() {
  const { data: products = [] } = useProducts();
  const [dialogOpen, setDialogOpen] = useState(false);
  const activeCount = products.filter((p) => p.isActive).length;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Product catalog</CardTitle>
            <CardDescription>
              {products.length} product{products.length === 1 ? "" : "s"} · {activeCount} active
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" /> Add product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New product</DialogTitle>
              </DialogHeader>
              <ProductForm onDone={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </CardHeader>

        <ProductList />
      </Card>
    </div>
  );
}
