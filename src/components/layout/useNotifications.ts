import { useMemo } from "react";
import { create } from "zustand";
import { useAllProductStock } from "@/features/inventory/hooks/useAllProductStock";
import { usePayRuleSettings } from "@/features/settings/hooks/usePayRuleSettings";
import { usePayrollHistory } from "@/features/payroll/hooks/usePayrollHistory";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import { useAttendance } from "@/features/attendance/hooks/useAttendance";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { formatQty, formatCurrencyCompact } from "@/utils/currency";
import { todayISO } from "@/utils/date";
import { ROLE_BASE_PATH } from "@/lib/constants";

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

const READ_KEY = "ap-notifications-read";
const DISMISSED_KEY = "ap-notifications-dismissed";

interface NotificationStore {
  readIds: string[];
  dismissedIds: string[];
  markRead: (id: string) => void;
  markAllRead: (ids: string[]) => void;
  dismiss: (id: string) => void;
}

function loadIds(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  readIds: loadIds(READ_KEY),
  dismissedIds: loadIds(DISMISSED_KEY),
  markRead: (id) =>
    set((s) => (s.readIds.includes(id) ? s : { readIds: [...s.readIds, id] })),
  markAllRead: (ids) =>
    set((s) => ({ readIds: [...new Set([...s.readIds, ...ids])] })),
  dismiss: (id) =>
    set((s) => ({
      dismissedIds: s.dismissedIds.includes(id)
        ? s.dismissedIds
        : [...s.dismissedIds, id],
      readIds: s.readIds.filter((rid) => rid !== id),
    })),
}));

useNotificationStore.subscribe((state) => {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify(state.readIds));
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(state.dismissedIds));
  } catch {
    // ignore storage errors
  }
});

const DAY_MS = 24 * 60 * 60 * 1000;
const RECENT_DAYS = 7;

export function useNotifications(): AppNotification[] {
  const { user } = useAuth();
  const stock = useAllProductStock();
  const { data: settings } = usePayRuleSettings();
  const { data: payroll = [] } = usePayrollHistory();
  const { data: employees = [] } = useEmployees();
  const { data: attendance = [] } = useAttendance();
  const readIds = useNotificationStore((s) => s.readIds);
  const dismissedIds = useNotificationStore((s) => s.dismissedIds);

  const isEmployee = user?.role === "staff";
  const basePath = ROLE_BASE_PATH[user?.role ?? "manager"];

  return useMemo(() => {
    const notifications: Omit<AppNotification, "read">[] = [];

    // Low stock alerts — admin only
    if (!isEmployee) {
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
          link: `${basePath}/inventory`,
        });
      });

      // Payroll — admin only
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
          link: `${basePath}/payroll`,
        });
      }

      // Recently added employees — admin only
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
          link: `${basePath}/employees`,
        });
      });
    }

    // Today's attendance summary — both roles
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
        link: `${basePath}/attendance`,
      });
    }

    return notifications
      .filter((n) => !dismissedIds.includes(n.id))
      .map((n) => ({ ...n, read: readIds.includes(n.id) }))
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [isEmployee, basePath, stock, settings, payroll, employees, attendance, readIds, dismissedIds]);
}
