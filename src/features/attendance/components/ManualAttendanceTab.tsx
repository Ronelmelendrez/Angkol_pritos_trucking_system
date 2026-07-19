import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useManualAttendance } from "../hooks/useAttendance";
import { useToast } from "@/components/ui/useToast";
import type { AttendanceRecord, AttendanceStatus } from "../types";
import type { Employee } from "@/features/employees/types";
import { cn } from "@/utils/cn";

interface Props {
  records: AttendanceRecord[];
  employees: Employee[];
}

export function ManualAttendanceTab({ records, employees }: Props) {
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const manualAttendance = useManualAttendance();
  const { toast } = useToast();

  const activeEmployees = useMemo(
    () => employees.filter((e) => e.isActive),
    [employees]
  );

  const dayRecords = useMemo(
    () => records.filter((r) => r.date === selectedDate),
    [records, selectedDate]
  );

  function getEmployeeStatus(employeeId: string): AttendanceStatus | null {
    const record = dayRecords.find((r) => r.employeeId === employeeId);
    return record?.status ?? null;
  }

  async function handleMark(employeeId: string, status: AttendanceStatus) {
    try {
      await manualAttendance.mutateAsync({ employeeId, date: selectedDate, status });
      const emp = activeEmployees.find((e) => e.id === employeeId);
      toast({
        title: `${emp?.name ?? "Employee"} marked as ${status}`,
        variant: "success",
      });
    } catch {
      toast({ title: "Failed to update attendance", variant: "error" });
    }
  }

  const presentCount = dayRecords.filter((r) => r.status === "present").length;
  const absentCount = dayRecords.filter((r) => r.status === "absent").length;

  return (
    <div className="space-y-4">
      {/* Date selector */}
      <div className="flex items-center justify-between rounded-lg border border-line bg-ink/[0.02] px-4 py-3">
        <button
          onClick={() => setSelectedDate(format(new Date(new Date(selectedDate).getTime() - 86400000), "yyyy-MM-dd"))}
          className="rounded-lg p-1.5 text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-ink">
            {format(new Date(selectedDate), "EEEE, MMM d, yyyy")}
          </p>
          <p className="text-xs text-ink-faint">
            {presentCount} present · {absentCount} absent · {activeEmployees.length} total
          </p>
        </div>
        <button
          onClick={() => setSelectedDate(format(new Date(new Date(selectedDate).getTime() + 86400000), "yyyy-MM-dd"))}
          className="rounded-lg p-1.5 text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Employee list */}
      <div className="space-y-2">
        {activeEmployees.map((emp) => {
          const status = getEmployeeStatus(emp.id);
          const isUpdating = manualAttendance.isPending;

          return (
            <div
              key={emp.id}
              className="flex items-center justify-between rounded-xl border border-line bg-surface p-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: emp.avatarColor }}
                >
                  {emp.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{emp.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {status && (
                  <Badge variant={status === "present" ? "success" : "danger"}>
                    {status === "present" ? (
                      <><CheckCircle className="h-3 w-3" /> Present</>
                    ) : (
                      <><XCircle className="h-3 w-3" /> Absent</>
                    )}
                  </Badge>
                )}
                <Button
                  size="sm"
                  variant={status === "present" ? "default" : "outline"}
                  onClick={() => handleMark(emp.id, "present")}
                  disabled={isUpdating}
                  className={cn(status === "present" && "bg-success text-white hover:bg-success/90")}
                >
                  {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                  Present
                </Button>
                <Button
                  size="sm"
                  variant={status === "absent" ? "default" : "outline"}
                  onClick={() => handleMark(emp.id, "absent")}
                  disabled={isUpdating}
                  className={cn(status === "absent" && "bg-danger text-white hover:bg-danger/90")}
                >
                  {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                  Absent
                </Button>
              </div>
            </div>
          );
        })}

        {activeEmployees.length === 0 && (
          <p className="py-8 text-center text-sm text-ink-faint">No active employees found.</p>
        )}
      </div>
    </div>
  );
}
