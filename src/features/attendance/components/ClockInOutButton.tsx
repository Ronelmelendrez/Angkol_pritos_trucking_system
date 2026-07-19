import { useState } from "react";
import { Clock, LogIn, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatTime } from "@/utils/date";
import { useClockIn, useClockOut } from "../hooks/useAttendance";
import { useToast } from "@/components/ui/useToast";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/AlertDialog";
import type { Employee } from "@/features/employees/types";
import type { AttendanceRecord } from "../types";

interface Props {
  employee: Employee;
  activeRecord?: AttendanceRecord;
}

function clockOutShift(): "half" | "full" {
  const hour = new Date().getHours();
  const minutes = new Date().getMinutes();
  return hour < 13 || (hour === 13 && minutes < 30) ? "half" : "full";
}

export function ClockInOutButton({ employee, activeRecord }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const clockIn = useClockIn();
  const clockOut = useClockOut();
  const { toast } = useToast();

  const record = activeRecord;
  const isClockedIn = !!record && !record.clockOut;
  const isPending = clockIn.isPending || clockOut.isPending;
  const shift = clockOutShift();

  async function handleClockIn() {
    try {
      await clockIn.mutateAsync(employee.id);
      toast({ title: `${employee.name} clocked in`, variant: "success" });
    } catch {
      toast({ title: "Couldn't update attendance", variant: "error" });
    }
  }

  async function handleConfirmClockOut() {
    if (!record) return;
    try {
      await clockOut.mutateAsync(record);
      toast({ title: `${employee.name} clocked out`, variant: "success" });
    } catch {
      toast({ title: "Couldn't update attendance", variant: "error" });
    }
    setConfirmOpen(false);
  }

  if (!isClockedIn) {
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
              Not clocked in
            </p>
          </div>
        </div>
        <Button
          size="touch"
          variant="default"
          onClick={handleClockIn}
          disabled={isPending}
          className="shrink-0"
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <LogIn className="h-5 w-5" />
          )}
          Clock in
        </Button>
      </div>
    );
  }

  return (
    <>
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
              {record?.clockIn ? `Clocked in at ${formatTime(record.clockIn)}` : ""}
            </p>
          </div>
        </div>
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogTrigger asChild>
            <Button
              size="touch"
              variant="destructive"
              disabled={isPending}
              className="shrink-0"
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <LogOut className="h-5 w-5" />
              )}
              Clock out
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm clock-out</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to clock out <strong>{employee.name}</strong>?
                {record && (
                  <span className="block mt-1 text-xs text-ink-faint">
                    Clocked in at {record.clockIn ? formatTime(record.clockIn) : "—"}
                  </span>
                )}
                <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-ink-faint">
                  Shift: <Badge variant={shift === "half" ? "warning" : "success"}>{shift === "half" ? "Half day" : "Full day"}</Badge>
                  {shift === "half" && <span className="text-ink-faint">(morning only)</span>}
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmClockOut}>
                Clock out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}