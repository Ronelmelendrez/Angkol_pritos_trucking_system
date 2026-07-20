import { useState, useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { formatQty } from "@/utils/currency";
import type { InventoryLedgerEntry } from "../types";

const PAGE_SIZE = 20;

interface Props {
  entries: InventoryLedgerEntry[];
  unit: string;
  isLoading?: boolean;
}

export function InventoryLedgerTable({ entries, unit, isLoading }: Props) {
  const [page, setPage] = useState(1);

  const sorted = useMemo(
    () => [...entries].sort((a, b) => b.date.localeCompare(a.date)),
    [entries],
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 w-full animate-pulse rounded bg-ink/[0.06]" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-ink-faint">No ledger entries for this period.</p>
    );
  }

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-line">
        <table className="w-full text-sm">
          <thead className="bg-ink/[0.03] text-left text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 text-right font-medium">Opening ({unit})</th>
              <th className="px-4 py-3 text-right font-medium">Purchased</th>
              <th className="px-4 py-3 text-right font-medium">Sold</th>
              <th className="px-4 py-3 text-right font-medium">Adjustment</th>
              <th className="px-4 py-3 text-right font-medium">Closing ({unit})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {pageItems.map((entry) => {
              const isNegative = entry.closingQty < 0;
              return (
                <tr
                  key={entry.date}
                  className={`bg-surface hover:bg-primary/[0.03] ${isNegative ? "bg-danger-bg/20" : ""}`}
                >
                  <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{entry.date}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-ink">{formatQty(entry.openingQty)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-ink">
                    {entry.purchasedQty > 0 ? formatQty(entry.purchasedQty) : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-ink">
                    {entry.soldQty > 0 ? formatQty(entry.soldQty) : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {entry.adjustmentQty !== 0 ? (
                      <span
                        className={`font-medium ${entry.adjustmentQty > 0 ? "text-success" : "text-danger"}`}
                        title={entry.adjustmentNote}
                      >
                        {entry.adjustmentQty > 0 ? "+" : ""}
                        {formatQty(entry.adjustmentQty)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td
                    className={`whitespace-nowrap px-4 py-3 text-right font-semibold ${
                      isNegative ? "flex items-center justify-end gap-1 text-danger" : "text-ink"
                    }`}
                  >
                    {isNegative && <AlertTriangle className="h-3.5 w-3.5" />}
                    {formatQty(entry.closingQty)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
