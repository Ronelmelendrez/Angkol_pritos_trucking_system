import { Progress } from "@/components/ui/Progress";
import { formatCurrency } from "@/utils/currency";
import { cn } from "@/utils/cn";

interface Props {
  recovered: number;
  total: number;
}

export function BatchProgress({ recovered, total }: Props) {
  const ratio = total > 0 ? recovered / total : 0;
  const percent = Math.min(ratio * 100, 100);
  const isProfitable = ratio >= 1;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className={cn(
          "font-medium",
          isProfitable ? "text-success" : "text-ink-soft"
        )}>
          {formatCurrency(recovered)} / {formatCurrency(total)}
        </span>
        {isProfitable && (
          <span className="font-semibold text-success">
            +{formatCurrency(recovered - total)} profit
          </span>
        )}
      </div>
      <Progress
        value={percent}
        className={cn(
          "h-2",
          isProfitable && "[&>[data-slot=progress-indicator]]:bg-success"
        )}
      />
    </div>
  );
}
