import { useEffect } from "react";
import { X, Bell, Package, DollarSign, Users, Clock } from "lucide-react";
import { cn } from "@/utils/cn";

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

const NOTIFICATIONS = [
  {
    id: 1,
    icon: Package,
    title: "Low stock alert",
    description: "Raw Chicken inventory is running low.",
    time: "2 min ago",
    read: false,
  },
  {
    id: 2,
    icon: DollarSign,
    title: "Payroll processed",
    description: "Weekly payroll for 8 employees completed.",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 3,
    icon: Users,
    title: "New employee added",
    description: "Juan Dela Cruz has been added to the team.",
    time: "3 hours ago",
    read: true,
  },
  {
    id: 4,
    icon: Clock,
    title: "Attendance summary",
    description: "Today's attendance: 7/8 employees present.",
    time: "5 hours ago",
    read: true,
  },
];

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[90] bg-ink/20 backdrop-blur-[1px]"
          onClick={onClose}
          aria-hidden
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 z-[95] flex h-full w-full max-w-sm flex-col border-l border-line bg-surface shadow-2xl transition-transform duration-200",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-4 py-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-ink" />
            <h2 className="text-sm font-semibold text-ink">Notifications</h2>
            {unreadCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-faint transition-colors hover:bg-ink/5 hover:text-ink"
            aria-label="Close notifications"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto">
          {NOTIFICATIONS.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex gap-3 border-b border-line px-4 py-3 transition-colors hover:bg-ink/[0.02]",
                !item.read && "bg-primary/[0.03]"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  !item.read ? "bg-primary/10 text-primary" : "bg-ink/5 text-ink-faint"
                )}
              >
                <item.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn("text-sm", !item.read ? "font-medium text-ink" : "text-ink-soft")}>
                    {item.title}
                  </p>
                  {!item.read && (
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
                <p className="text-xs text-ink-faint">{item.description}</p>
                <p className="mt-1 text-[11px] text-ink-faint/60">{item.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-line px-4 py-3">
          <button className="w-full rounded-lg py-2 text-center text-xs font-medium text-primary transition-colors hover:bg-primary/5">
            Mark all as read
          </button>
        </div>
      </div>
    </>
  );
}
