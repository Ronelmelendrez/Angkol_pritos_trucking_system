import { useEffect } from "react";
import { X, Bell, Package, DollarSign, Users, Clock, TrendingDown, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/utils/cn";
import { relativeTime } from "@/utils/date";
import { useNotifications, useNotificationStore, type NotificationKind } from "./useNotifications";

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

const ICONS: Record<NotificationKind, typeof Package> = {
  "low-stock": TrendingDown,
  payroll: DollarSign,
  employee: Users,
  attendance: Clock,
};

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const dismiss = useNotificationStore((s) => s.dismiss);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  function handleOpen(item: (typeof notifications)[number]) {
    if (!item.read) markRead(item.id);
    onClose();
    if (item.link) navigate(item.link);
  }

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
          {notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <Bell className="mb-2 h-8 w-8 text-ink-faint" />
              <p className="text-sm font-medium text-ink">No notifications</p>
              <p className="text-xs text-ink-faint">Updates from your business will show up here.</p>
            </div>
          )}

          {notifications.map((item) => {
            const Icon = ICONS[item.kind];
            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => handleOpen(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleOpen(item);
                  }
                }}
                className={cn(
                  "flex w-full cursor-pointer gap-3 border-b border-line px-4 py-3 text-left transition-colors hover:bg-ink/[0.02] focus:outline-none focus-visible:bg-ink/[0.03]",
                  !item.read && "bg-primary/[0.03]"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    !item.read ? "bg-primary/10 text-primary" : "bg-ink/5 text-ink-faint"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn("text-sm", !item.read ? "font-medium text-ink" : "text-ink-soft")}>
                      {item.title}
                    </p>
                    <span className="flex shrink-0 items-center gap-1">
                      {!item.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dismiss(item.id);
                        }}
                        className="rounded-md p-1 text-ink-faint/60 transition-colors hover:bg-ink/5 hover:text-danger"
                        aria-label={`Dismiss ${item.title} notification`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  </div>
                  <p className="text-xs text-ink-faint">{item.description}</p>
                  <p className="mt-1 text-[11px] text-ink-faint/60">{relativeTime(item.timestamp)}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-line px-4 py-3">
            <button
              onClick={() => markAllRead(notifications.map((n) => n.id))}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-center text-xs font-medium text-primary transition-colors hover:bg-primary/5"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all as read
            </button>
          </div>
        )}
      </div>
    </>
  );
}
