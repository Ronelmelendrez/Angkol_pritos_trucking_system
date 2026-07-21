import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/utils/cn";

interface Props {
  current: number;
  previous: number;
  className?: string;
}

export function TrendBadge({ current, previous, className }: Props) {
  const diff = previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0;
  const rounded = Math.round(diff);
  const isUp = rounded > 0;
  const isDown = rounded < 0;
  const isFlat = rounded === 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[11px] font-semibold",
        isUp && "text-success",
        isDown && "text-danger",
        isFlat && "text-ink-faint",
        className,
      )}
    >
      {isUp ? (
        <TrendingUp className="h-3 w-3" />
      ) : isDown ? (
        <TrendingDown className="h-3 w-3" />
      ) : (
        <Minus className="h-3 w-3" />
      )}
      {isFlat ? "0%" : `${isUp ? "+" : ""}${rounded}%`}
    </span>
  );
}
