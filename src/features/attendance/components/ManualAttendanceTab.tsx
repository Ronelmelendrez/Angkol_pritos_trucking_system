import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Loader2, Sun, Clock, Users, Store, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { useManualAttendance, useBulkAttendance, useReopenDay } from "../hooks/useAttendance";
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
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const manualAttendance = useManualAttendance();
  const bulkAttendance = useBulkAttendance();
  const reopenDay = useReopenDay();
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
      } else if (status === "closed") {
        toast({ title: `${emp?.name ?? "Employee"} marked as store closed`, variant: "success" });
      } else {
        toast({ title: `${emp?.name ?? "Employee"} marked absent`, variant: "success" });
      }
    } catch {
      toast({ title: "Failed to update attendance", variant: "error" });
    }
    setShiftPickerId(null);
  }

  const presentCount = dayRecords.filter((r) => r.status === "present").length;
  const absentCount = dayRecords.filter((r) => r.status === "absent").length;
  const closedCount = dayRecords.filter((r) => r.status === "closed").length;
  const isStoreClosed = activeEmployees.length > 0 && closedCount === activeEmployees.length;

  const unmarkedIds = useMemo(() => {
    const markedIds = new Set(dayRecords.map((r) => r.employeeId));
    return activeEmployees.filter((e) => !markedIds.has(e.id)).map((e) => e.id);
  }, [activeEmployees, dayRecords]);

  async function handleBulk(status: AttendanceStatus, shift?: ShiftType) {
    const targetIds = status === "closed" ? activeEmployees.map((e) => e.id) : unmarkedIds;
    if (targetIds.length === 0) return;
    try {
      await bulkAttendance.mutateAsync({ employeeIds: targetIds, date: selectedDate, status, shift });
      if (status === "closed") {
        toast({ title: `Store marked as closed for ${format(new Date(selectedDate), "MMM d")}`, variant: "success" });
      } else {
        const label = status === "present" ? `All ${targetIds.length} employees present` : `All ${targetIds.length} employees absent`;
        toast({ title: label, variant: "success" });
      }
    } catch {
      toast({ title: "Failed to update attendance", variant: "error" });
    }
  }

  async function handleReopen() {
    try {
      await reopenDay.mutateAsync({ date: selectedDate });
      toast({ title: `Store reopened for ${format(new Date(selectedDate), "MMM d")}`, variant: "success" });
    } catch {
      toast({ title: "Failed to reopen store", variant: "error" });
    }
    setShowCloseConfirm(false);
  }

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
            {isStoreClosed ? (
              "Store closed"
            ) : (
              <>
                {presentCount} present · {absentCount} absent · {activeEmployees.length} total
                {closedCount > 0 && <> · {closedCount} closed</>}
              </>
            )}
          </p>
        </div>
        <button
          onClick={() => setSelectedDate(format(new Date(new Date(selectedDate).getTime() + 86400000), "yyyy-MM-dd"))}
          className="rounded-lg p-1.5 text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Store closed banner */}
      {isStoreClosed && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
          <Store className="h-5 w-5 text-amber-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Store Closed</p>
            <p className="text-xs text-amber-600">
              All {activeEmployees.length} employees marked as closed for this day.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReopen}
            disabled={reopenDay.isPending}
            className="gap-1.5 text-xs text-amber-700 border-amber-300 hover:bg-amber-100"
          >
            {reopenDay.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
            Reopen
          </Button>
        </div>
      )}

      {/* Bulk actions */}
      {!isStoreClosed && unmarkedIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-primary/30 bg-primary/5 px-4 py-3">
          <Users className="h-4 w-4 text-primary-dark" />
          <span className="text-xs font-medium text-primary-dark">
            {unmarkedIds.length} unmarked
          </span>
          <div className="flex w-full flex-col gap-2 sm:ml-auto sm:w-auto sm:flex-row">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulk("present", "full")}
              disabled={bulkAttendance.isPending}
              className="w-full justify-center gap-1.5 text-xs sm:w-auto"
            >
              {bulkAttendance.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Clock className="h-3 w-3" />}
              All present (Full)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulk("present", "half")}
              disabled={bulkAttendance.isPending}
              className="w-full justify-center gap-1.5 text-xs sm:w-auto"
            >
              {bulkAttendance.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sun className="h-3 w-3" />}
              All present (Half)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulk("absent")}
              disabled={bulkAttendance.isPending}
              className="w-full justify-center gap-1.5 text-xs sm:w-auto"
            >
              {bulkAttendance.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
              All absent
            </Button>
          </div>
        </div>
      )}

      {/* Close store button */}
      {!isStoreClosed && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowCloseConfirm(true)}
          disabled={bulkAttendance.isPending}
          className="gap-1.5 text-xs"
        >
          {bulkAttendance.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Store className="h-3 w-3" />}
          Close store
        </Button>
      )}

      {/* Close store confirmation */}
      <Dialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Close store?
            </DialogTitle>
            <DialogDescription>
              This will mark <strong>{activeEmployees.length} active employees</strong> as closed for{" "}
              <strong>{format(new Date(selectedDate), "EEEE, MMM d, yyyy")}</strong>.
              Closed records will not count toward payroll.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCloseConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => { handleBulk("closed"); setShowCloseConfirm(false); }}
              disabled={bulkAttendance.isPending}
              className="gap-1.5"
            >
              {bulkAttendance.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Store className="h-3 w-3" />}
              Yes, close store
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
              className={cn(
                "rounded-xl border border-line bg-surface p-4",
                status === "closed" && "opacity-60"
              )}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: emp.avatarColor }}
                  >
                    {emp.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{emp.name}</p>
                    {status === "present" && (
                      <p className="text-xs text-ink-faint">
                        {shift
                          ? `${shift === "full" ? "Full day" : "Half day"} · ${shift === "full" ? "5:00 AM – 7:00 PM" : "5:00 AM – 12:00 PM"}`
                          : "Clocked in"}
                        {record?.hoursWorked != null && ` · ${record.hoursWorked}h`}
                      </p>
                    )}
                    {status === "closed" && (
                      <p className="text-xs text-amber-600">Store closed</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2">
                  {status && (
                    <Badge variant={status === "present" ? "success" : status === "closed" ? "warning" : "danger"}>
                      {status === "present" ? (
                        <><CheckCircle className="h-3 w-3" /> {shift === "full" ? "Full day" : shift === "half" ? "Half day" : "Present"}</>
                      ) : status === "closed" ? (
                        <><Store className="h-3 w-3" /> Closed</>
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
                      className={cn("flex-1 justify-center sm:flex-none", status === "present" && "bg-success text-white hover:bg-success/90")}
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
                    className={cn("flex-1 justify-center sm:flex-none", status === "absent" && "bg-danger text-white hover:bg-danger/90")}
                  >
                    {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                    Absent
                  </Button>
                </div>
              </div>

              {/* Inline shift picker */}
              {showShiftPicker && (
                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-line bg-ink/[0.02] p-3">
                  <span className="w-full text-xs font-medium text-ink-soft sm:w-auto">Select shift:</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMark(emp.id, "present", "half")}
                    disabled={isUpdating}
                    className="flex-1 justify-center gap-1.5 sm:flex-none"
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
                    className="flex-1 justify-center gap-1.5 sm:flex-none"
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
                    className="flex-1 justify-center text-xs sm:flex-none"
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
