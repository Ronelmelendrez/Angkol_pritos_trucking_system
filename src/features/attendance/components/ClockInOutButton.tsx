import { useState } from "react";
import { Clock, LogIn, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
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

export function ClockInOutButton({ employee, activeRecord }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const clockIn = useClockIn();
  const clockOut = useClockOut();
  const { toast } = useToast();
  const isClockedIn = !!activeRecord && !activeRecord.clockOut;
  const isPending = clockIn.isPending || clockOut.isPending;

  async function handleClockIn() {
    try {
      await clockIn.mutateAsync(employee.id);
      toast({ title: `${employee.name} clocked in`, variant: "success" });
    } catch {
      toast({ title: "Couldn't update attendance", variant: "error" });
    }
  }

  async function handleConfirmClockOut() {
    if (!activeRecord) return;
    try {
      await clockOut.mutateAsync(activeRecord);
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
              {activeRecord ? `Clocked in at ${formatTime(activeRecord.clockIn)}` : ""}
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
                {activeRecord && (
                  <span className="block mt-1 text-xs text-ink-faint">
                    Clocked in at {formatTime(activeRecord.clockIn)}
                  </span>
                )}
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