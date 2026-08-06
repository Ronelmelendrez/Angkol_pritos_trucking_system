import { AlertTriangle, PartyPopper } from "lucide-react";
import { usePayRuleSettings } from "@/features/settings/hooks/usePayRuleSettings";
import { useAdjustmentReport } from "../hooks/useAdjustmentReport";
import { AdjustmentSummaryStats } from "./AdjustmentSummaryStats";
import { AdjustmentTrendChart } from "./AdjustmentTrendChart";
import { AdjustmentByProductChart } from "./AdjustmentByProductChart";
import { AdjustmentReasonDonut } from "./AdjustmentReasonDonut";
import { AdjustmentLog } from "./AdjustmentLog";

interface Props {
  dateRange: string[];
}

export function AdjustmentReportView({ dateRange }: Props) {
  const report = useAdjustmentReport(dateRange);
  const { data: settings } = usePayRuleSettings();
  const threshold = settings?.spoilageRateThreshold ?? 5;

  const rate = report.lossRate;
  const priorRate = report.priorRate;
  const overThreshold = rate != null && rate > threshold;
  const jumped = rate != null && priorRate != null && priorRate > 0 && rate >= 1.5 * priorRate;
  const showBanner = overThreshold || jumped;

  if (report.incidents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <PartyPopper className="mb-2 h-8 w-8 text-success" />
        <p className="text-sm font-medium text-ink">No losses recorded this period</p>
        <p className="text-xs text-ink-faint">No stock was written off. Keep it up.</p>
      </div>
    );
  }

  const bannerMessage = showBanner
    ? overThreshold
      ? jumped
        ? `Loss rate is ${rate!.toFixed(1)}% — above your ${threshold}% threshold and sharply up from ${priorRate!.toFixed(1)}% last period.`
        : `Loss rate is ${rate!.toFixed(1)}%, above your ${threshold}% threshold.`
      : `Loss rate is ${rate!.toFixed(1)}%, sharply up from ${priorRate!.toFixed(1)}% last period.`
    : "";

  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-faint">
        {report.incidents.length} incident{report.incidents.length === 1 ? "" : "s"} in period
      </p>

      {showBanner && (
        <div className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger-bg p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
          <div>
            <p className="text-sm font-semibold text-danger">Stock losses are up</p>
            <p className="text-xs text-danger">{bannerMessage}</p>
          </div>
        </div>
      )}

      <AdjustmentSummaryStats report={report} />

      <AdjustmentTrendChart data={report.trend} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AdjustmentByProductChart data={report.byProduct} />
        <AdjustmentReasonDonut data={report.byReason} />
      </div>

      <AdjustmentLog incidents={report.incidents} />
    </div>
  );
}
