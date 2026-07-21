import { useState } from "react";
import { ClipboardList, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { useAdjustmentsLog } from "../hooks/useAdjustmentsLog";
import { useDeleteStockAdjustment } from "../hooks/useDeleteStockAdjustment";
import { StockAdjustmentDialog } from "./StockAdjustmentDialog";
import { BatchStockEntryForm } from "./BatchStockEntryForm";
import { formatQty } from "@/utils/currency";

const PAGE_SIZE = 10;

export function InventoryAdjustmentsTab() {
  const adjustments = useAdjustmentsLog();
  const deleteAdjustment = useDeleteStockAdjustment();
  const [addOpen, setAddOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(adjustments.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = adjustments.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <StockAdjustmentDialog open={addOpen} onOpenChange={setAddOpen} />
      <BatchStockEntryForm open={batchOpen} onOpenChange={setBatchOpen} />

      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-faint">
          {adjustments.length} adjustment{adjustments.length === 1 ? "" : "s"} recorded
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setBatchOpen(true)}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Batch entry
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Add adjustment
          </Button>
        </div>
      </div>

      {adjustments.length === 0 ? (
        <div className="text-center py-10">
          <ClipboardList className="mx-auto mb-2 h-8 w-8 text-ink-faint" />
          <p className="text-sm font-medium text-ink">No adjustments yet</p>
          <p className="text-xs text-ink-faint">Manual corrections (spoilage, waste, recount) will appear here.</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-line">
            <table className="w-full text-sm">
              <thead className="bg-ink/3 text-left text-xs uppercase tracking-wide text-ink-soft">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 text-right font-medium">Quantity</th>
                  <th className="px-4 py-3 font-medium">Reason</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {pageItems.map((adj) => (
                  <tr key={adj.id} className="bg-surface hover:bg-primary/[0.03]">
                    <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{adj.date}</td>
                    <td className="px-4 py-3 font-medium text-ink">{adj.productName}</td>
                    <td className={`whitespace-nowrap px-4 py-3 text-right font-semibold ${adj.quantity < 0 ? "text-danger" : "text-success"}`}>
                      {adj.quantity > 0 ? "+" : ""}{formatQty(adj.quantity)}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{adj.note}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-ink-faint hover:text-danger"
                        onClick={() => deleteAdjustment.mutate(adj.id)}
                        disabled={deleteAdjustment.isPending}
                        aria-label={`Delete adjustment for ${adj.productName}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
