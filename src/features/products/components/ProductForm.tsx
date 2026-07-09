import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { productSchema, type ProductFormValues } from "@/utils/validators";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useAddProduct, useUpdateProduct } from "../hooks/useProducts";
import { useToast } from "@/components/ui/useToast";
import type { Product } from "../types";

interface Props {
  initial?: Product;
  onDone?: () => void;
}

export function ProductForm({ initial, onDone }: Props) {
  const { toast } = useToast();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const isEditing = !!initial;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as unknown as Resolver<ProductFormValues>,
    defaultValues: initial
      ? { name: initial.name, defaultPrice: initial.defaultPrice, unit: initial.unit, reorderThreshold: initial.reorderThreshold }
      : { name: "", defaultPrice: 0, unit: "order" },
  });

  async function onSubmit(values: ProductFormValues) {
    try {
      if (isEditing && initial) {
        await updateProduct.mutateAsync({ id: initial.id, ...values });
        toast({ title: "Product updated", description: values.name, variant: "success" });
      } else {
        await addProduct.mutateAsync({ ...values, isActive: true });
        toast({ title: "Product added", description: values.name, variant: "success" });
      }
      onDone?.();
    } catch {
      toast({ title: `Couldn't ${isEditing ? "update" : "add"} product`, variant: "error" });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="product-name">Product name</Label>
        <Input id="product-name" placeholder="e.g. Fried Chicken" {...register("name")} />
        {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="product-price">Default price (₱)</Label>
          <Input id="product-price" type="number" step="0.01" min="0" {...register("defaultPrice")} />
          {errors.defaultPrice && <p className="mt-1 text-xs text-danger">{errors.defaultPrice.message}</p>}
        </div>
        <div>
          <Label htmlFor="product-unit">Unit</Label>
          <Input id="product-unit" placeholder="e.g. order, piece, kg" {...register("unit")} />
          {errors.unit && <p className="mt-1 text-xs text-danger">{errors.unit.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="product-threshold">Reorder threshold (optional)</Label>
        <Input id="product-threshold" type="number" step="1" min="0" {...register("reorderThreshold")} placeholder="e.g. 5" />
        {errors.reorderThreshold && <p className="mt-1 text-xs text-danger">{errors.reorderThreshold.message}</p>}
        <p className="mt-1 text-xs text-ink-faint">Low-stock alert triggers when current qty drops below this.</p>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={addProduct.isPending || updateProduct.isPending}>
        {(addProduct.isPending || updateProduct.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
        {isEditing ? "Update product" : "Add product"}
      </Button>
    </form>
  );
}
