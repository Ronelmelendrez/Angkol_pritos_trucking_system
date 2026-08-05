import { AlertTriangle, TrendingDown, Percent } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatCurrency, formatQty } from "@/utils/currency";
import type { AdjustmentReportData } from "../hooks/useAdjustmentReport";

interface Props {
  report: AdjustmentReportData;
}

export function AdjustmentSummaryStats({ report }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        icon={<TrendingDown className="h-4 w-4" />}
        label="Lost this period"
        value={`${formatQty(report.totalQty)}`}
        sub={`${report.incidents.length} loss entr${report.incidents.length === 1 ? "y" : "ies"}`}
      />
      <StatCard
        icon={<AlertTriangle className="h-4 w-4" />}
        label="Est. cost lost"
        value={report.totalCost != null ? formatCurrency(report.totalCost) : "—"}
        sub={
          report.totalCost != null
            ? report.missingCostCount > 0
              ? `cost data unavailable for ${report.missingCostCount} entr${report.missingCostCount === 1 ? "y" : "ies"}`
              : "based on purchase prices & product costs"
            : "no purchase history or product cost set"
        }
      />
      <StatCard
        icon={<Percent className="h-4 w-4" />}
        label="Loss rate"
        value={report.lossRate != null ? `${report.lossRate.toFixed(1)}%` : "—"}
        sub="of stock purchased this period"
      />
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}

function StatCard({ icon, label, value, sub }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-center gap-2 text-xs font-medium text-ink-faint">
        <span className="text-danger">{icon}</span>
        {label}
      </div>
      <p className="mt-1.5 text-2xl font-bold text-ink">{value}</p>
      <p className="mt-0.5 text-xs text-ink-faint">{sub}</p>
    </Card>
  );
}
