import { AlertTriangle, PartyPopper } from "lucide-react";
import { usePayRuleSettings } from "@/features/settings/hooks/usePayRuleSettings";
import { useSpoilageReport } from "../hooks/useSpoilageReport";
import { SpoilageSummaryStats } from "./SpoilageSummaryStats";
import { SpoilageTrendChart } from "./SpoilageTrendChart";
import { SpoilageByProductChart } from "./SpoilageByProductChart";
import { SpoilageReasonDonut } from "./SpoilageReasonDonut";
import { SpoilageLog } from "./SpoilageLog";

interface Props {
  dateRange: string[];
  selectedProductId: string;
}

export function SpoilageReportView({ dateRange, selectedProductId }: Props) {
  const report = useSpoilageReport(dateRange, selectedProductId);
  const { data: settings } = usePayRuleSettings();
  const threshold = settings?.spoilageRateThreshold ?? 5;

  const rate = report.spoilageRate;
  const priorRate = report.priorRate;
  const overThreshold = rate != null && rate > threshold;
  const jumped = rate != null && priorRate != null && priorRate > 0 && rate >= 1.5 * priorRate;
  const showBanner = overThreshold || jumped;

  if (report.incidents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <PartyPopper className="mb-2 h-8 w-8 text-success" />
        <p className="text-sm font-medium text-ink">No spoilage recorded this period</p>
        <p className="text-xs text-ink-faint">Nothing had to be thrown out. Keep it up.</p>
      </div>
    );
  }

  const bannerMessage = showBanner
    ? overThreshold
      ? jumped
        ? `Spoilage rate is ${rate!.toFixed(1)}% — above your ${threshold}% threshold and sharply up from ${priorRate!.toFixed(1)}% last period.`
        : `Spoilage rate is ${rate!.toFixed(1)}%, above your ${threshold}% threshold.`
      : `Spoilage rate is ${rate!.toFixed(1)}%, sharply up from ${priorRate!.toFixed(1)}% last period.`
    : "";

  return (
    <div className="space-y-6">
      {showBanner && (
        <div className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger-bg p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
          <div>
            <p className="text-sm font-semibold text-danger">Spoilage is up</p>
            <p className="text-xs text-danger">{bannerMessage}</p>
          </div>
        </div>
      )}

      <SpoilageSummaryStats report={report} />

      <SpoilageTrendChart data={report.trend} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SpoilageByProductChart data={report.byProduct} />
        <SpoilageReasonDonut data={report.byReason} />
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-ink-faint">Incident log</p>
        <SpoilageLog incidents={report.incidents} />
      </div>
    </div>
  );
}
