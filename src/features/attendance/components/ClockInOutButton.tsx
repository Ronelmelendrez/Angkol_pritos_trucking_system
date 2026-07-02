import { Clock, LogIn, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/utils/date";
import { useClockIn, useClockOut } from "../hooks/useAttendance";
import { useToast } from "@/components/ui/use-toast";
import type { Employee } from "@/features/employees/types";
import type { AttendanceRecord } from "../types";

interface Props {
  employee: Employee;
  activeRecord?: AttendanceRecord;
}

export function ClockInOutButton({ employee, activeRecord }: Props) {
  const clockIn = useClockIn();
  const clockOut = useClockOut();
  const { toast } = useToast();
  const isClockedIn = !!activeRecord && !activeRecord.clockOut;
  const isPending = clockIn.isPending || clockOut.isPending;

  async function handleClick() {
    try {
      if (isClockedIn && activeRecord) {
        await clockOut.mutateAsync(activeRecord);
        toast({ title: `${employee.name} clocked out`, variant: "success" });
      } else {
        await clockIn.mutateAsync(employee.id);
        toast({ title: `${employee.name} clocked in`, variant: "success" });
      }
    } catch {
      toast({ title: "Couldn't update attendance", variant: "error" });
    }
  }

  return (
    <div
      className="ticket ticket-perf flex items-center justify-between gap-3 p-4"
      data-testid={`attendance-row-${employee.id}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: employee.avatarColor }}
        >
          {employee.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{employee.name}</p>
          <p className="flex items-center gap-1 text-xs text-ink-soft">
            <Clock className="h-3 w-3" />
            {isClockedIn && activeRecord
              ? `Clocked in at ${formatTime(activeRecord.clockIn)}`
              : "Not clocked in"}
          </p>
        </div>
      </div>
      <Button
        size="touch"
        variant={isClockedIn ? "destructive" : "default"}
        onClick={handleClick}
        disabled={isPending}
        className="shrink-0"
      >
        {isPending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isClockedIn ? (
          <LogOut className="h-5 w-5" />
        ) : (
          <LogIn className="h-5 w-5" />
        )}
        {isClockedIn ? "Clock out" : "Clock in"}
      </Button>
    </div>
  );
}