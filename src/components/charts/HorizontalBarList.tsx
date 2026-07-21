import { cn } from "@/utils/cn";

interface BarItem {
  label: string;
  value: number;
  color?: string;
}

interface Props {
  items: BarItem[];
  formatValue?: (value: number) => string;
  className?: string;
}

export function HorizontalBarList({ items, formatValue, className }: Props) {
  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item, idx) => {
        const pct = max > 0 ? (item.value / max) * 100 : 0;
        return (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="truncate font-medium text-ink">{item.label}</span>
              <span className="shrink-0 pl-2 text-xs font-semibold text-ink">
                {formatValue ? formatValue(item.value) : item.value}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-ink/5">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  backgroundColor: item.color ?? "var(--color-primary)",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
