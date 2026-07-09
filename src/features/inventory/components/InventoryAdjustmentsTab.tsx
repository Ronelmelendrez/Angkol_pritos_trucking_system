import { ClipboardList } from "lucide-react";
import { useAdjustmentsLog } from "../hooks/useAdjustmentsLog";

export function InventoryAdjustmentsTab() {
  const adjustments = useAdjustmentsLog();

  if (adjustments.length === 0) {
    return (
      <div className="text-center py-10">
        <ClipboardList className="mx-auto mb-2 h-8 w-8 text-ink-faint" />
        <p className="text-sm font-medium text-ink">No adjustments yet</p>
        <p className="text-xs text-ink-faint">Manual corrections (spoilage, waste, recount) will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-line">
        <table className="w-full text-sm">
          <thead className="bg-ink/[0.03] text-left text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 text-right font-medium">Quantity</th>
              <th className="px-4 py-3 font-medium">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {adjustments.map((adj) => (
              <tr key={adj.id} className="bg-surface hover:bg-primary/[0.03]">
                <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{adj.date}</td>
                <td className="px-4 py-3 font-medium text-ink">{adj.productName}</td>
                <td className={`whitespace-nowrap px-4 py-3 text-right font-semibold ${adj.quantity < 0 ? "text-danger" : "text-success"}`}>
                  {adj.quantity > 0 ? "+" : ""}{adj.quantity}
                </td>
                <td className="px-4 py-3 text-ink-soft">{adj.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
