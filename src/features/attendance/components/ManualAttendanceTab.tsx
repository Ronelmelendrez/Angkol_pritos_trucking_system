import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Loader2, Sun, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useManualAttendance } from "../hooks/useAttendance";
import { useToast } from "@/components/ui/useToast";
import type { AttendanceRecord, AttendanceStatus, ShiftType } from "../types";
import type { Employee } from "@/features/employees/types";
import { cn } from "@/utils/cn";

interface Props {
  records: AttendanceRecord[];
  employees: Employee[];
}

export function ManualAttendanceTab({ records, employees }: Props) {
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [shiftPickerId, setShiftPickerId] = useState<string | null>(null);
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

  function getEmployeeRecord(employeeId: string): AttendanceRecord | undefined {
    return dayRecords.find((r) => r.employeeId === employeeId);
  }

  async function handleMark(employeeId: string, status: AttendanceStatus, shift?: ShiftType) {
    try {
      await manualAttendance.mutateAsync({ employeeId, date: selectedDate, status, shift });
      const emp = activeEmployees.find((e) => e.id === employeeId);
      if (status === "present" && shift) {
        const timeLabel = shift === "full" ? "5:00 AM – 7:00 PM" : "5:00 AM – 12:00 PM";
        toast({
          title: `${emp?.name ?? "Employee"} marked present (${shift === "full" ? "Full day" : "Half day"})`,
          description: timeLabel,
          variant: "success",
        });
      } else {
        toast({
          title: `${emp?.name ?? "Employee"} marked absent`,
          variant: "success",
        });
      }
    } catch {
      toast({ title: "Failed to update attendance", variant: "error" });
    }
    setShiftPickerId(null);
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
          const record = getEmployeeRecord(emp.id);
          const status = record?.status ?? null;
          const shift = record?.shift ?? null;
          const isUpdating = manualAttendance.isPending;
          const showShiftPicker = shiftPickerId === emp.id;

          return (
            <div
              key={emp.id}
              className="rounded-xl border border-line bg-surface p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: emp.avatarColor }}
                  >
                    {emp.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">{emp.name}</p>
                    {status === "present" && shift && (
                      <p className="text-xs text-ink-faint">
                        {shift === "full" ? "Full day · 5:00 AM – 7:00 PM" : "Half day · 5:00 AM – 12:00 PM"}
                        {record?.hoursWorked != null && ` · ${record.hoursWorked}h`}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {status && (
                    <Badge variant={status === "present" ? "success" : "danger"}>
                      {status === "present" ? (
                        <><CheckCircle className="h-3 w-3" /> {shift === "full" ? "Full" : "Half"}</>
                      ) : (
                        <><XCircle className="h-3 w-3" /> Absent</>
                      )}
                    </Badge>
                  )}

                  {/* Present button — opens shift picker inline */}
                  {!showShiftPicker && (
                    <Button
                      size="sm"
                      variant={status === "present" ? "default" : "outline"}
                      onClick={() => setShiftPickerId(emp.id)}
                      disabled={isUpdating}
                      className={cn(status === "present" && "bg-success text-white hover:bg-success/90")}
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Present
                    </Button>
                  )}

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

              {/* Inline shift picker */}
              {showShiftPicker && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-line bg-ink/[0.02] p-3">
                  <span className="text-xs font-medium text-ink-soft">Select shift:</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMark(emp.id, "present", "half")}
                    disabled={isUpdating}
                    className="gap-1.5"
                  >
                    {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sun className="h-3.5 w-3.5" />}
                    Half day
                    <span className="text-[10px] text-ink-faint">5 AM – 12 PM</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMark(emp.id, "present", "full")}
                    disabled={isUpdating}
                    className="gap-1.5"
                  >
                    {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Clock className="h-3.5 w-3.5" />}
                    Full day
                    <span className="text-[10px] text-ink-faint">5 AM – 7 PM</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShiftPickerId(null)}
                    disabled={isUpdating}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              )}
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
