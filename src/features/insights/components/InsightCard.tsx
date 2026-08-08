import { AlertTriangle, TrendingUp, Info, ArrowRight, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import type { Insight, InsightTone } from "../types";

const TONE_STYLES: Record<InsightTone, { icon: LucideIcon; classes: string }> = {
  positive: { icon: TrendingUp, classes: "bg-success-bg text-success" },
  warning: { icon: AlertTriangle, classes: "bg-warning-bg text-warning" },
  neutral: { icon: Info, classes: "bg-primary/10 text-primary-dark" },
};

export function InsightCard({ insight }: { insight: Insight }) {
  const { icon: Icon, classes } = TONE_STYLES[insight.tone];

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-line bg-bg/60 p-4">
      <div className="flex items-center gap-2">
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${classes}`}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-sm font-semibold text-ink">{insight.title}</p>
      </div>
      <p className="text-xs leading-relaxed text-ink-soft">{insight.message}</p>
      {insight.link && (
        <Link
          to={insight.link}
          className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          View <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}
