import { NavLink } from "react-router-dom"
import { ChevronLeft, ChevronRight, Drumstick, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NAV_ITEMS } from "@/components/layout/navConfig"
import { useUIStore } from "@/app/store/uiStore"
import { useLogout } from "@/features/auth"

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { logout } = useLogout()

  return (
    <aside
      className={cn(
        "hidden md:flex md:flex-col border-r border-border bg-card shrink-0 transition-[width] duration-200",
        sidebarCollapsed ? "md:w-[72px]" : "md:w-60"
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b border-border px-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Drumstick className="size-5" />
        </div>
        {!sidebarCollapsed && (
          <span className="truncate font-display text-base font-semibold text-char-900">
            Lechon &amp; Manok
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-ember-100 text-ember-700"
                      : "text-char-700 hover:bg-muted",
                    sidebarCollapsed && "justify-center px-2"
                  )
                }
                title={sidebarCollapsed ? item.label : undefined}
              >
                <item.icon className="size-5 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-border p-2">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-char-700",
            sidebarCollapsed && "justify-center px-2"
          )}
          onClick={() => logout()}
        >
          <LogOut className="size-5 shrink-0" />
          {!sidebarCollapsed && "Log out"}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="mt-1 w-full"
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </Button>
      </div>
    </aside>
  )
}