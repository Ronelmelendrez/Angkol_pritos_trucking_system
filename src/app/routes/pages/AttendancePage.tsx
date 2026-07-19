import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import { useAttendance } from "@/features/attendance/hooks/useAttendance";
import { ClockInOutButton } from "@/features/attendance/components/ClockInOutButton";
import { AttendanceLog } from "@/features/attendance/components/AttendanceLog";
import { AttendanceCalendar } from "@/features/attendance/components/AttendanceCalendar";
import { ManualAttendanceTab } from "@/features/attendance/components/ManualAttendanceTab";
import { AttendanceDayDetail } from "@/features/attendance/components/AttendanceDayDetail";
import { isDateToday } from "@/utils/date";

export function AttendancePage() {
  const { data: employees = [] } = useEmployees();
  const { data: attendance = [], isLoading } = useAttendance();

  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const activeEmployees = employees.filter((e) => e.isActive);
  const todaysRecords = attendance.filter((a) => isDateToday(a.date));

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Clock in / clock out</CardTitle>
            <CardDescription>Tap to record today's shift</CardDescription>
          </div>
        </CardHeader>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {activeEmployees.map((emp) => {
            const active = todaysRecords.find(
              (a) => a.employeeId === emp.id && !a.clockOut,
            );
            return <ClockInOutButton key={emp.id} employee={emp} activeRecord={active} />;
          })}
        </div>
      </Card>

      <Card>
        <Tabs defaultValue="history">
          <div className="mb-4 flex items-center justify-between">
            <CardTitle>Attendance records</CardTitle>
            <TabsList>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="manual">Manual</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="history">
            <AttendanceLog records={attendance} employees={employees} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="calendar">
            <AttendanceCalendar
              records={attendance}
              onDayClick={setSelectedDay}
            />
          </TabsContent>
          <TabsContent value="manual">
            <ManualAttendanceTab records={attendance} employees={employees} />
          </TabsContent>
        </Tabs>
      </Card>

      <AttendanceDayDetail
        date={selectedDay}
        records={attendance}
        employees={employees}
        onClose={() => setSelectedDay(null)}
      />
    </div>
  );
}
