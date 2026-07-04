import { NavLink } from "react-router-dom"
import { cn } from "@/utils/cn"
import { NAV_ITEMS } from "@/components/layout/navConfig"

export function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-surface md:hidden">
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
                    ? "text-primary-dark"
                    : "text-ink-soft hover:text-ink"
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="truncate max-w-[64px]">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}