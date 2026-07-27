import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { startOfWeek } from "date-fns/startOfWeek";
import { endOfWeek } from "date-fns/endOfWeek";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { DatePresets, type DatePreset } from "@/components/ui/DatePresets";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import { useAttendance } from "@/features/attendance/hooks/useAttendance";
import { AttendanceLog } from "@/features/attendance/components/AttendanceLog";
import { AttendanceCalendar } from "@/features/attendance/components/AttendanceCalendar";
import { ManualAttendanceTab } from "@/features/attendance/components/ManualAttendanceTab";
import { AttendanceDayDetail } from "@/features/attendance/components/AttendanceDayDetail";
import { AttendanceFiltersBar, type AttendanceFilters } from "@/features/attendance/components/AttendanceFilters";

export function AttendancePage() {
  const { data: employees = [] } = useEmployees();
  const { data: attendance = [], isLoading } = useAttendance();

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [filters, setFilters] = useState<AttendanceFilters>({ search: "", employeeId: "all", status: "all", shift: "all" });
  const [datePreset, setDatePreset] = useState<DatePreset>("this-month");
  const [customFrom, setCustomFrom] = useState(format(new Date(), "yyyy-MM-dd"));
  const [customTo, setCustomTo] = useState(format(new Date(), "yyyy-MM-dd"));

  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");

  const dateFrom = useMemo(() => {
    switch (datePreset) {
      case "today": return todayStr;
      case "this-week": return format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
      case "this-month": return format(startOfMonth(today), "yyyy-MM-dd");
      case "custom": return customFrom;
    }
  }, [datePreset, customFrom, todayStr]);

  const dateTo = useMemo(() => {
    switch (datePreset) {
      case "today": return todayStr;
      case "this-week": return format(endOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
      case "this-month": return format(endOfMonth(today), "yyyy-MM-dd");
      case "custom": return customTo;
    }
  }, [datePreset, customTo, todayStr]);

  const filtered = useMemo(() => {
    return attendance.filter((r) => {
      if (dateFrom && r.date < dateFrom) return false;
      if (dateTo && r.date > dateTo) return false;
      if (filters.employeeId !== "all" && r.employeeId !== filters.employeeId) return false;
      if (filters.status !== "all" && r.status !== filters.status) return false;
      if (filters.shift !== "all" && r.shift !== filters.shift) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const emp = employees.find((e) => e.id === r.employeeId);
        if (!emp || !emp.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [attendance, dateFrom, dateTo, filters, employees]);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Mark attendance</CardTitle>
        </CardHeader>
        <ManualAttendanceTab records={filtered} employees={employees} />
      </Card>

      <Card>
        <Tabs defaultValue="history">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Records</CardTitle>
            <TabsList>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
            </TabsList>
          </div>

          <div className="mb-4 flex flex-col gap-3">
            <AttendanceFiltersBar filters={filters} onChange={setFilters} employees={employees} />
            <DatePresets
              value={datePreset}
              onChange={setDatePreset}
              customFrom={customFrom}
              customTo={customTo}
              onCustomFromChange={setCustomFrom}
              onCustomToChange={setCustomTo}
            />
          </div>

          <TabsContent value="history">
            <AttendanceLog records={filtered} employees={employees} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="calendar">
            <AttendanceCalendar
              records={filtered}
              onDayClick={setSelectedDay}
            />
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
