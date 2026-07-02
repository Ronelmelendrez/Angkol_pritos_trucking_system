import { useMemo } from "react";
import { eachDayOfInterval, format, isSameMonth } from "date-fns";
import { monthRange } from "@/utils/date";
import { cn } from "@/utils/cn";
import type { AttendanceRecord } from "../types";

interface Props {
  records: AttendanceRecord[];
}

/** Lightweight month grid showing which days had any clock-in, like a
 * receipt calendar — darker dot = more people worked that day. */
export function AttendanceCalendar({ records }: Props) {
  const { start, end } = monthRange();

  const days = useMemo(() => eachDayOfInterval({ start, end }), [start, end]);

  const countByDay = useMemo(() => {
    const map = new Map<string, number>();
    records.forEach((r) => {
      map.set(r.date, (map.get(r.date) ?? 0) + 1);
    });
    return map;
  }, [records]);

  const leadingBlanks = start.getDay();

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase text-ink-faint">
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
          const count = countByDay.get(key) ?? 0;
          const inMonth = isSameMonth(day, start);
          return (
            <div
              key={key}
              className={cn(
                "flex aspect-square flex-col items-center justify-center rounded-lg text-xs",
                !inMonth && "opacity-30",
                count === 0 && "bg-ink/[0.04] text-ink-faint",
                count > 0 && count < 3 && "bg-primary/15 text-primary-dark font-medium",
                count >= 3 && "bg-primary text-white font-semibold"
              )}
              title={`${count} clock-in${count === 1 ? "" : "s"}`}
            >
              {format(day, "d")}
            </div>
          );
        })}
      </div>
    </div>
  );
}