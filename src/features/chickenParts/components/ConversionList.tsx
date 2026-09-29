import { useState } from "react";
import {
  Copy,
  Eye,
  Pencil,
  Power,
  Trash2,
  Drumstick,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/AlertDialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { useToast } from "@/components/ui/useToast";
import { formatCurrency, formatQty } from "@/utils/currency";
import {
  useChickenPartConversions,
  useDeleteChickenPartConversion,
  useDuplicateChickenPartConversion,
  useToggleChickenPartConversion,
} from "../hooks/useChickenPartConversions";
import { ConversionForm } from "./ConversionForm";
import { calculateBreakdown } from "../utils/calculateBreakdown";
import type { ChickenPartConversion } from "../types";

export function ConversionList() {
  const { data: conversions = [], isLoading } = useChickenPartConversions();
  const [editing, setEditing] = useState<ChickenPartConversion | null>(null);
  const [viewing, setViewing] = useState<ChickenPartConversion | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ChickenPartConversion | null>(null);
  const toggleConversion = useToggleChickenPartConversion();
  const duplicateConversion = useDuplicateChickenPartConversion();
  const deleteConversion = useDeleteChickenPartConversion();
  const { toast } = useToast();

  async function handleToggle(conversion: ChickenPartConversion) {
    try {
      await toggleConversion.mutateAsync({
        id: conversion.id,
        isActive: !conversion.isActive,
      });
      toast({
        title: conversion.isActive ? "Conversion deactivated" : "Conversion activated",
        description: conversion.name,
        variant: "success",
      });
    } catch {
      toast({ title: "Couldn't update conversion", variant: "error" });
    }
  }

  async function handleDuplicate(conversion: ChickenPartConversion) {
    try {
      await duplicateConversion.mutateAsync(conversion);
      toast({
        title: "Conversion duplicated",
        description: `${conversion.name} copied as an inactive draft.`,
        variant: "success",
      });
    } catch {
      toast({ title: "Couldn't duplicate conversion", variant: "error" });
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteConversion.mutateAsync(deleteTarget.id);
      toast({ title: "Conversion deleted", description: deleteTarget.name, variant: "success" });
    } catch {
      toast({ title: "Couldn't delete conversion", variant: "error" });
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

  if (conversions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line py-14 text-center">
        <Drumstick className="mb-2 h-8 w-8 text-ink-faint" />
        <p className="text-sm font-medium text-ink">No conversions yet</p>
        <p className="text-xs text-ink-faint">
          Add your first conversion to break a whole chicken into parts.
        </p>
      </div>
    );
  }

  return (
    <>
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit conversion</DialogTitle>
          </DialogHeader>
          {editing && (
            <ConversionForm initial={editing} onDone={() => setEditing(null)} />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewing?.name}</DialogTitle>
            <DialogDescription>
              {viewing && (
                <>
                  Base weight {formatQty(viewing.baseWeightKg)} kg ·{" "}
                  {viewing.items.length} part{viewing.items.length === 1 ? "" : "s"}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {viewing && <ConversionDetail conversion={viewing} />}
        </DialogContent>
      </Dialog>

      <div className="overflow-hidden rounded-xl border border-line">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Conversion</TableHead>
              <TableHead>Base weight</TableHead>
              <TableHead>Parts</TableHead>
              <TableHead className="text-right">Value / base</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {conversions.map((conversion) => {
              const perBase = calculateBreakdown(conversion, 1).grandTotal;
              return (
                <TableRow key={conversion.id}>
                  <TableCell className="font-medium text-ink">{conversion.name}</TableCell>
                  <TableCell>{formatQty(conversion.baseWeightKg)} kg</TableCell>
                  <TableCell>
                    <span className="text-xs text-ink-soft">
                      {conversion.items
                        .map((i) => `${i.partName} ×${formatQty(i.quantityPerBase)}`)
                        .join(", ") || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-ink">
                    {formatCurrency(perBase)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={conversion.isActive ? "success" : "neutral"}>
                      {conversion.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-ink-faint hover:text-primary"
                        onClick={() => setViewing(conversion)}
                        aria-label={`View ${conversion.name}`}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-ink-faint hover:text-primary"
                        onClick={() => setEditing(conversion)}
                        aria-label={`Edit ${conversion.name}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-ink-faint hover:text-primary"
                        onClick={() => handleDuplicate(conversion)}
                        aria-label={`Duplicate ${conversion.name}`}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-ink-faint hover:text-warning"
                        onClick={() => handleToggle(conversion)}
                        aria-label={`${conversion.isActive ? "Deactivate" : "Activate"} ${conversion.name}`}
                      >
                        <Power className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-ink-faint hover:text-danger"
                        onClick={() => setDeleteTarget(conversion)}
                        aria-label={`Delete ${conversion.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversion</AlertDialogTitle>
            <AlertDialogDescription>
              Delete{" "}
              <span className="font-medium text-ink">{deleteTarget?.name}</span> and its{" "}
              {deleteTarget?.items.length ?? 0} part configuration
              {deleteTarget?.items.length === 1 ? "" : "s"}? To keep the history,
              deactivate it instead.
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

function ConversionDetail({ conversion }: { conversion: ChickenPartConversion }) {
  const single = calculateBreakdown(conversion, 1);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm">
        <span className="text-ink-soft">Base weight</span>
        <span className="font-semibold text-ink">
          {formatQty(conversion.baseWeightKg)} kg
        </span>
      </div>
      <div className="overflow-hidden rounded-xl border border-line">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Part</TableHead>
              <TableHead className="text-right">Qty / base</TableHead>
              <TableHead className="text-right">Price / pc</TableHead>
              <TableHead className="text-right">Total / base</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {single.rows.map((row) => (
              <TableRow key={row.partName}>
                <TableCell className="font-medium text-ink">{row.partName}</TableCell>
                <TableCell className="text-right">{formatQty(row.quantityPerBase)}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.pricePerPiece)}</TableCell>
                <TableCell className="text-right font-semibold text-ink">
                  {formatCurrency(row.totalPrice)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-dashed border-line px-3 py-2 text-sm">
        <span className="text-ink-soft">Value per base unit</span>
        <span className="font-semibold text-ink">{formatCurrency(single.grandTotal)}</span>
      </div>
    </div>
  );
}
