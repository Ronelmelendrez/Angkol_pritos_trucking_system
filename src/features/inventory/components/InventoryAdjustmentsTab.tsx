import { useMemo, useState } from "react";
import { ClipboardList, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { useAdjustmentsLog } from "../hooks/useAdjustmentsLog";
import { useDeleteStockAdjustment } from "../hooks/useDeleteStockAdjustment";
import { useExpenses } from "@/features/expenses/hooks/useExpenses";
import { useProducts } from "@/features/products/hooks/useProducts";
import { estimateUnitCost } from "../utils/estimateUnitCost";
import { ADJUSTMENT_REASONS, REASON_META } from "../utils/reasonMeta";
import type { AdjustmentReason } from "../types";
import { StockAdjustmentDialog } from "./StockAdjustmentDialog";
import { BatchStockEntryForm } from "./BatchStockEntryForm";
import { AdjustmentReportView } from "./AdjustmentReportView";
import { formatCurrency, formatQty } from "@/utils/currency";

const PAGE_SIZE = 10;

interface Props {
  dateRange: string[];
  selectedProductId: string;
}

export function InventoryAdjustmentsTab({ dateRange, selectedProductId }: Props) {
  const { log: adjustments } = useAdjustmentsLog();
  const deleteAdjustment = useDeleteStockAdjustment();
  const { data: expenses = [] } = useExpenses();
  const { data: products = [] } = useProducts();

  const [addOpen, setAddOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [reasonFilter, setReasonFilter] = useState<AdjustmentReason | "all">("all");

  const filtered = useMemo(() => {
    const rangeStart = dateRange[0];
    const rangeEnd = dateRange[dateRange.length - 1];
    return adjustments.filter((adj) => {
      if (selectedProductId && adj.productId !== selectedProductId) return false;
      if (adj.date < rangeStart || adj.date > rangeEnd) return false;
      if (reasonFilter !== "all" && adj.reason !== reasonFilter) return false;
      return true;
    });
  }, [adjustments, selectedProductId, dateRange, reasonFilter]);

  const rows = useMemo(() => {
    const unitCosts = new Map<string, number | null>();
    const costFor = (productId: string) => {
      if (!unitCosts.has(productId)) unitCosts.set(productId, estimateUnitCost(productId, products, expenses));
      return unitCosts.get(productId);
    };
    return filtered.map((adj) => {
      const unitCost = costFor(adj.productId);
      const cost = adj.quantity < 0 && unitCost != null ? Math.abs(adj.quantity) * unitCost : null;
      return { ...adj, cost };
    });
  }, [filtered, expenses, products]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="log">
        <TabsList>
          <TabsTrigger value="log">Log</TabsTrigger>
          <TabsTrigger value="spoilage">Adjustment report</TabsTrigger>
        </TabsList>

        <TabsContent value="log">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-ink-faint">
                {rows.length} adjustment{rows.length === 1 ? "" : "s"} in period
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={reasonFilter}
                  onValueChange={(v) => {
                    setReasonFilter(v as AdjustmentReason | "all");
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All reasons</SelectItem>
                    {ADJUSTMENT_REASONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {REASON_META[r].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => setBatchOpen(true)}>
                  <Plus className="mr-1 h-3.5 w-3.5" /> Batch entry
                </Button>
                <Button size="sm" onClick={() => setAddOpen(true)}>
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add adjustment
                </Button>
              </div>
            </div>

            {rows.length === 0 ? (
              <div className="py-10 text-center">
                <ClipboardList className="mx-auto mb-2 h-8 w-8 text-ink-faint" />
                <p className="text-sm font-medium text-ink">No adjustments in this period</p>
                <p className="text-xs text-ink-faint">
                  Manual corrections (spoilage, waste, recount) will appear here.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-xl border border-line">
                  <table className="w-full min-w-[680px] text-sm">
                    <thead className="bg-ink/3 text-left text-xs uppercase tracking-wide text-ink-soft">
                      <tr>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Product</th>
                        <th className="px-4 py-3 text-right font-medium">Quantity</th>
                        <th className="px-4 py-3 font-medium">Reason</th>
                        <th className="px-4 py-3 text-right font-medium">Est. ₱ impact</th>
                        <th className="px-4 py-3 font-medium">Note</th>
                        <th className="px-4 py-3 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {pageItems.map((adj) => (
                        <tr key={adj.id} className="bg-surface hover:bg-primary/3">
                          <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{adj.date}</td>
                          <td className="px-4 py-3 font-medium text-ink">{adj.productName}</td>
                          <td
                            className={`whitespace-nowrap px-4 py-3 text-right font-semibold ${
                              adj.quantity < 0 ? "text-danger" : "text-success"
                            }`}
                          >
                            {adj.quantity > 0 ? "+" : ""}
                            {formatQty(adj.quantity)}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={REASON_META[adj.reason].variant}>
                              {REASON_META[adj.reason].label}
                            </Badge>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-ink-soft">
                            {adj.cost != null ? formatCurrency(adj.cost) : "—"}
                          </td>
                          <td className="max-w-48 truncate px-4 py-3 text-ink-soft" title={adj.note}>
                            {adj.note || "—"}
                          </td>
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
        </TabsContent>

        <TabsContent value="spoilage">
          <AdjustmentReportView dateRange={dateRange} selectedProductId={selectedProductId} />
        </TabsContent>
      </Tabs>

      <StockAdjustmentDialog open={addOpen} onOpenChange={setAddOpen} />
      <BatchStockEntryForm open={batchOpen} onOpenChange={setBatchOpen} />
    </div>
  );
}
