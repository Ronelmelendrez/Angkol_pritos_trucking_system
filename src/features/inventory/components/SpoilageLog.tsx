import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatQty } from "@/utils/currency";
import { REASON_META } from "../utils/reasonMeta";
import type { SpoilageIncident } from "../hooks/useSpoilageReport";

interface Props {
  incidents: SpoilageIncident[];
}

export function SpoilageLog({ incidents }: Props) {
  if (incidents.length === 0) {
    return (
      <p className="py-8 text-center text-xs text-ink-faint">No spoilage/waste incidents this period.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-ink/3 text-left text-xs uppercase tracking-wide text-ink-soft">
          <tr>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Product</th>
            <th className="px-4 py-3 text-right font-medium">Quantity</th>
            <th className="px-4 py-3 font-medium">Reason</th>
            <th className="px-4 py-3 text-right font-medium">Est. ₱ impact</th>
            <th className="px-4 py-3 font-medium">Note</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {incidents.map((incident) => (
            <tr key={incident.id} className="bg-surface hover:bg-primary/[0.03]">
              <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{incident.date}</td>
              <td className="px-4 py-3 font-medium text-ink">{incident.productName}</td>
              <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-danger">
                {formatQty(incident.quantity)}
              </td>
              <td className="px-4 py-3">
                <Badge variant={REASON_META[incident.reason].variant}>
                  {REASON_META[incident.reason].label}
                </Badge>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right text-ink-soft">
                {incident.cost != null ? formatCurrency(incident.cost) : "—"}
              </td>
              <td className="max-w-56 truncate px-4 py-3 text-ink-soft" title={incident.note}>
                {incident.note || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
