import { useState, useEffect } from "react";
import { Menu, LogOut, Settings, Search, Bell, Command, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUiStore } from "@/app/store/useUiStore";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { CommandSearch } from "@/components/layout/CommandSearch";
import { NotificationPanel } from "@/components/layout/NotificationPanel";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/DropdownMenu";
import { useToast } from "@/components/ui/useToast";

export function Header({ title }: { title: string }) {
  const { toggleSidebar } = useUiStore();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  async function handleLogout() {
    await logout();
    toast({ title: "Signed out", variant: "default" });
    navigate("/login", { replace: true });
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-bg/90 px-4 py-3 backdrop-blur sm:px-6">
        {/* Left: hamburger + breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-2 text-ink-soft hover:bg-ink/5 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-1.5 text-sm text-ink-faint">
            <span className="hidden sm:inline">Dashboard</span>
            <ChevronRight className="hidden h-3 w-3 sm:inline" />
            <span className="font-medium text-ink">{title}</span>
          </div>
        </div>

        {/* Right: search trigger + notifications + avatar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-ink-faint transition-colors hover:border-primary/30 hover:text-ink"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden items-center gap-0.5 rounded border border-line bg-background px-1.5 py-0.5 text-[10px] font-medium text-ink-faint sm:inline-flex">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </button>

          <button
            onClick={() => setNotifOpen(true)}
            className="relative rounded-lg p-2 text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
            aria-label="Notifications"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white cursor-pointer transition-transform hover:scale-105">
                AP
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <div className="px-2.5 py-2">
                <p className="text-sm font-medium text-ink">{user?.name}</p>
                <p className="text-xs capitalize text-ink-faint">{user?.role}</p>
              </div>
              <div className="my-1 h-px bg-line" />
              <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CommandSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
}