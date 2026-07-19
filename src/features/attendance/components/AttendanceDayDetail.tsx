import { useMemo } from "react";
import { X, CheckCircle, XCircle, Clock } from "lucide-react";
import { formatDate } from "@/utils/date";
import { Badge } from "@/components/ui/Badge";
import type { AttendanceRecord } from "../types";
import type { Employee } from "@/features/employees/types";

interface Props {
  date: string | null;
  records: AttendanceRecord[];
  employees: Employee[];
  onClose: () => void;
}

export function AttendanceDayDetail({ date, records, employees, onClose }: Props) {
  const dayRecords = useMemo(() => {
    if (!date) return [];
    return records.filter((r) => r.date === date);
  }, [records, date]);

  if (!date) return null;

  const present = dayRecords.filter(
    (r) => r.status === "present" || (!r.status && r.clockIn)
  );
  const absent = dayRecords.filter((r) => r.status === "absent");
  const total = employees.filter((e) => e.isActive);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[90] bg-ink/20 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-[95] flex h-full w-full max-w-sm flex-col border-l border-line bg-surface shadow-2xl transition-transform duration-200 translate-x-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-4 py-4">
          <div>
            <h2 className="text-sm font-semibold text-ink">{formatDate(date)}</h2>
            <p className="text-xs text-ink-faint">
              {present.length} present · {absent.length} absent · {total.length} total
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-faint transition-colors hover:bg-ink/5 hover:text-ink"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Employee list */}
        <div className="flex-1 overflow-y-auto">
          {total.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-ink-faint">No active employees.</p>
          ) : (
            total.map((emp) => {
              const record = dayRecords.find((r) => r.employeeId === emp.id);
              const status = record?.status ?? (record?.clockIn ? "present" : null);

              return (
                <div
                  key={emp.id}
                  className="flex items-center justify-between border-b border-line px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: emp.avatarColor }}
                    >
                      {emp.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">{emp.name}</p>
                      {record?.clockIn && (
                        <p className="text-xs text-ink-faint">
                          <Clock className="mr-1 inline h-3 w-3" />
                          {record.clockIn && new Date(record.clockIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {record.clockOut
                            ? ` – ${new Date(record.clockOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                            : " – ongoing"}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    {status === "present" && (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle className="h-3 w-3" /> Present
                      </Badge>
                    )}
                    {status === "absent" && (
                      <Badge variant="danger" className="gap-1">
                        <XCircle className="h-3 w-3" /> Absent
                      </Badge>
                    )}
                    {!status && (
                      <Badge variant="neutral">No record</Badge>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
