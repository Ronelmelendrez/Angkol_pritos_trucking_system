import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"
import { NAV_ITEMS } from "@/components/layout/navConfig"

/**
 * Mobile bottom tab navigation.
 * Visible only on small screens (< md breakpoint).
 * Each tab is a large, touch-friendly tap target (min 48px).
 */
export function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card md:hidden safe-area-bottom">
      <ul className="flex items-center justify-around">
        {NAV_ITEMS.map((item) => (
          <li key={item.path} className="flex-1">
            <NavLink
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                  "min-h-[56px] justify-center",
                  isActive
                    ? "text-ember-600"
                    : "text-char-500 hover:text-char-700"
                )
              }
            >
              <item.icon className="size-5 shrink-0" />
              <span className="truncate max-w-[64px]">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}