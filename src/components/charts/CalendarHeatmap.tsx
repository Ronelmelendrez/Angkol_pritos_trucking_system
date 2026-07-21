import { useMemo, useState } from "react";
import { eachDayOfInterval, format, startOfMonth, endOfMonth, isSameMonth } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

interface DataPoint {
  date: string;
  value: number;
}

interface Props {
  data: DataPoint[];
  color?: string;
  maxValue?: number;
  title?: string;
}

function shiftMonth(date: Date, delta: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + delta);
  return d;
}

export function CalendarHeatmap({ data, color = "var(--color-primary)", maxValue, title }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const valueMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((d) => map.set(d.date, d.value));
    return map;
  }, [data]);

  const max = maxValue ?? Math.max(1, ...data.map((d) => d.value));

  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start, end });
  const leadingBlanks = start.getDay();

  return (
    <div>
      {title && (
        <div className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-faint">{title}</div>
      )}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => setCurrentMonth(shiftMonth(currentMonth, -1))}
          className="rounded-lg p-1 text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="text-xs font-semibold text-ink">{format(currentMonth, "MMM yyyy")}</span>
        <button
          onClick={() => setCurrentMonth(shiftMonth(currentMonth, 1))}
          className="rounded-lg p-1 text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[9px] font-medium text-ink-faint">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const value = valueMap.get(key) ?? 0;
          const intensity = max > 0 ? value / max : 0;
          const inMonth = isSameMonth(day, start);

          return (
            <div
              key={key}
              className={cn(
                "aspect-square rounded-sm transition-colors",
                !inMonth && "opacity-20",
                intensity === 0 && "bg-ink/5",
              )}
              style={
                intensity > 0
                  ? { backgroundColor: color, opacity: 0.15 + intensity * 0.85 }
                  : undefined
              }
              title={`${format(day, "MMM d")}: ${value}`}
            />
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-end gap-1 text-[9px] text-ink-faint">
        <span>Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((level) => (
          <div
            key={level}
            className="h-2.5 w-2.5 rounded-sm"
            style={{
              backgroundColor: level === 0 ? "var(--color-ink)" : color,
              opacity: level === 0 ? 0.05 : 0.15 + level * 0.85,
            }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
