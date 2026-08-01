import { useMemo } from "react";
import { create } from "zustand";
import { useAllProductStock } from "@/features/inventory/hooks/useAllProductStock";
import { usePayRuleSettings } from "@/features/settings/hooks/usePayRuleSettings";
import { usePayrollHistory } from "@/features/payroll/hooks/usePayrollHistory";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import { useAttendance } from "@/features/attendance/hooks/useAttendance";
import { formatQty, formatCurrencyCompact } from "@/utils/currency";
import { todayISO } from "@/utils/date";

export type NotificationKind = "low-stock" | "payroll" | "employee" | "attendance";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  description: string;
  timestamp: string;
  link?: string;
  read: boolean;
}

const STORAGE_KEY = "ap-notifications-read";

interface NotificationStore {
  readIds: string[];
  markRead: (id: string) => void;
  markAllRead: (ids: string[]) => void;
}

function loadReadIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  readIds: loadReadIds(),
  markRead: (id) =>
    set((s) => (s.readIds.includes(id) ? s : { readIds: [...s.readIds, id] })),
  markAllRead: (ids) =>
    set((s) => ({ readIds: [...new Set([...s.readIds, ...ids])] })),
}));

useNotificationStore.subscribe((state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.readIds));
  } catch {
    // ignore storage errors
  }
});

const DAY_MS = 24 * 60 * 60 * 1000;
const RECENT_DAYS = 7;

export function useNotifications(): AppNotification[] {
  const stock = useAllProductStock();
  const { data: settings } = usePayRuleSettings();
  const { data: payroll = [] } = usePayrollHistory();
  const { data: employees = [] } = useEmployees();
  const { data: attendance = [] } = useAttendance();
  const readIds = useNotificationStore((s) => s.readIds);

  return useMemo(() => {
    const notifications: Omit<AppNotification, "read">[] = [];

    // Low stock alerts
    const threshold = settings?.defaultReorderThreshold ?? 5;
    const lowItems = stock
      .filter((item) => item.closingQty >= 0 && item.closingQty <= threshold)
      .sort((a, b) => a.closingQty - b.closingQty)
      .slice(0, 5);
    lowItems.forEach((item) => {
      notifications.push({
        id: `low-stock-${item.productId}`,
        kind: "low-stock",
        title: "Low stock alert",
        description: `${item.productName} is down to ${formatQty(item.closingQty)} ${item.unit} (threshold ${threshold}).`,
        timestamp: new Date().toISOString(),
        link: "/dashboard/inventory",
      });
    });

    // Payroll — most recently paid batch
    const paid = payroll.filter((r) => r.status === "paid" && r.paidAt);
    if (paid.length > 0) {
      const latest = paid
        .slice()
        .sort((a, b) => (b.paidAt ?? "").localeCompare(a.paidAt ?? ""))[0];
      const batch = paid.filter((r) => r.paidAt === latest.paidAt);
      const total = batch.reduce((sum, r) => sum + r.netPay, 0);
      notifications.push({
        id: `payroll-${latest.paidAt}`,
        kind: "payroll",
        title: "Payroll completed",
        description: `${batch.length} employee${batch.length === 1 ? "" : "s"} paid — total ${formatCurrencyCompact(total)}.`,
        timestamp: latest.paidAt ?? new Date().toISOString(),
        link: "/dashboard/payroll",
      });
    }

    // Recently added employees
    const now = new Date().getTime();
    const recent = employees
      .filter((e) => {
        const created = e.createdAt ? Date.parse(e.createdAt) : Date.parse(e.hireDate);
        return Number.isFinite(created) && now - created < RECENT_DAYS * DAY_MS;
      })
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
      .slice(0, 3);
    recent.forEach((emp) => {
      notifications.push({
        id: `employee-${emp.id}`,
        kind: "employee",
        title: "New employee added",
        description: `${emp.name} has been added to the team.`,
        timestamp: emp.createdAt ?? emp.hireDate,
        link: "/dashboard/employees",
      });
    });

    // Today's attendance summary
    const today = todayISO();
    const activeCount = employees.filter((e) => e.isActive).length;
    const todayPresent = attendance.filter(
      (a) => a.date === today && (a.status === "present" || (!a.status && a.clockIn)),
    ).length;
    if (activeCount > 0) {
      notifications.push({
        id: `attendance-${today}`,
        kind: "attendance",
        title: "Attendance summary",
        description:
          todayPresent > 0
            ? `Today's attendance: ${todayPresent}/${activeCount} present.`
            : "No one has clocked in yet today.",
        timestamp: new Date().toISOString(),
        link: "/dashboard/attendance",
      });
    }

    return notifications
      .map((n) => ({ ...n, read: readIds.includes(n.id) }))
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [stock, settings, payroll, employees, attendance, readIds]);
}
