import { CalendarClock } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatTime } from "@/utils/date";
import type { AttendanceRecord } from "../types";
import type { Employee } from "@/features/employees/types";

interface Props {
  records: AttendanceRecord[];
  employees: Employee[];
  isLoading: boolean;
}

export function AttendanceLog({ records, employees, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line py-14 text-center">
        <CalendarClock className="mb-2 h-8 w-8 text-ink-faint" />
        <p className="text-sm font-medium text-ink">No attendance recorded yet</p>
      </div>
    );
  }

  const employeeName = (id: string) => employees.find((e) => e.id === id)?.name ?? "Unknown";

  const sorted = [...records].sort((a, b) => (a.clockIn < b.clockIn ? 1 : -1));

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <table className="w-full text-sm">
        <thead className="bg-ink/3 text-left text-xs uppercase tracking-wide text-ink-soft">
          <tr>
            <th className="px-4 py-3 font-medium">Employee</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Clock in</th>
            <th className="px-4 py-3 font-medium">Clock out</th>
            <th className="px-4 py-3 text-right font-medium">Hours</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {sorted.map((r) => (
            <tr key={r.id} className="bg-surface">
              <td className="px-4 py-3 font-medium text-ink">{employeeName(r.employeeId)}</td>
              <td className="px-4 py-3 text-ink-soft">{formatDate(r.date)}</td>
              <td className="px-4 py-3 text-ink-soft">{formatTime(r.clockIn)}</td>
              <td className="px-4 py-3">
                {r.clockOut ? (
                  <span className="text-ink-soft">{formatTime(r.clockOut)}</span>
                ) : (
                  <Badge variant="success">In progress</Badge>
                )}
              </td>
              <td className="px-4 py-3 text-right text-ink">
                {r.hoursWorked != null ? `${r.hoursWorked.toFixed(2)} hrs` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}