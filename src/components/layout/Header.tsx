import { Menu, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUiStore } from "@/app/store/useUiStore";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Button } from "@/components/ui/Button";
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

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium leading-tight text-ink">{user?.name}</p>
          <p className="text-[11px] capitalize leading-tight text-ink-faint">{user?.role}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sign out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}