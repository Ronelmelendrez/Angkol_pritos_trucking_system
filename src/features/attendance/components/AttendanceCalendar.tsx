import { useState, useMemo } from "react";
import { eachDayOfInterval, format, isSameMonth, startOfMonth, endOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";
import type { AttendanceRecord } from "../types";

interface Props {
  records: AttendanceRecord[];
  onDayClick?: (date: string) => void;
}

function shiftMonth(date: Date, delta: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + delta);
  return d;
}

export function AttendanceCalendar({ records, onDayClick }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);

  const days = useMemo(() => eachDayOfInterval({ start, end }), [start, end]);

  const dayStats = useMemo(() => {
    const map = new Map<string, { present: number; absent: number }>();
    records.forEach((r) => {
      const stats = map.get(r.date) ?? { present: 0, absent: 0 };
      if (r.status === "absent") {
        stats.absent++;
      } else {
        stats.present++;
      }
      map.set(r.date, stats);
    });
    return map;
  }, [records]);

  const leadingBlanks = start.getDay();

  return (
    <div>
      {/* Month navigation */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setCurrentMonth(shiftMonth(currentMonth, -1))}
          className="rounded-lg p-1.5 text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="text-sm font-semibold text-ink">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <button
          onClick={() => setCurrentMonth(shiftMonth(currentMonth, 1))}
          className="rounded-lg p-1.5 text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase text-ink-faint">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const stats = dayStats.get(key);
          const count = (stats?.present ?? 0) + (stats?.absent ?? 0);
          const hasAbsences = (stats?.absent ?? 0) > 0;
          const inMonth = isSameMonth(day, start);

          return (
            <button
              key={key}
              onClick={() => onDayClick?.(key)}
              className={cn(
                "flex aspect-square flex-col items-center justify-center rounded-lg text-xs transition-all",
                !inMonth && "opacity-30",
                count === 0 && "bg-ink/4 text-ink-faint hover:bg-ink/8",
                count > 0 && !hasAbsences && "bg-primary/15 text-primary-dark font-medium hover:bg-primary/25",
                hasAbsences && "bg-danger-bg text-danger font-medium hover:bg-danger-bg/80",
              )}
              title={
                count > 0
                  ? `${stats?.present ?? 0} present, ${stats?.absent ?? 0} absent`
                  : "No records"
              }
            >
              {format(day, "d")}
              {count > 0 && (
                <span className="mt-0.5 text-[9px] leading-none">
                  {stats?.present ?? 0}/{count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 text-[11px] text-ink-faint">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-primary/15" /> All present
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-danger-bg" /> Has absences
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-ink/4" /> No data
        </div>
      </div>
    </div>
  );
}
