import { Menu, LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUiStore } from "@/app/store/useUiStore";
import { useAuth } from "@/features/auth/hooks/useAuth";
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

  async function handleLogout() {
    await logout();
    toast({ title: "Signed out", variant: "default" });
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-bg/90 px-4 py-3.5 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-ink-soft hover:bg-ink/5 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="stamp text-lg font-semibold text-ink sm:text-xl">{title}</h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="outline-none">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white cursor-pointer hover:opacity-90 transition-opacity">
            AP
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
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
    </header>
  );
}