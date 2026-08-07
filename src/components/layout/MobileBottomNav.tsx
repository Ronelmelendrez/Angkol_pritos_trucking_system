import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Receipt,
  CalendarClock,
  ShoppingCart,
  HandCoins,
} from "lucide-react"
import { cn } from "@/utils/cn"

const CORE_ITEMS = [
  { path: "/dashboard", label: "Home", icon: LayoutDashboard, end: true },
  { path: "/dashboard/expenses", label: "Expenses", icon: Receipt },
  { path: "/dashboard/attendance", label: "Attendance", icon: CalendarClock },
  { path: "/dashboard/sales", label: "Sales", icon: ShoppingCart },
  { path: "/dashboard/advances", label: "Advances", icon: HandCoins },
]

export function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-surface/95 backdrop-blur-sm lg:hidden safe-bottom">
      <ul className="flex items-stretch">
        {CORE_ITEMS.map((item) => (
          <li key={item.path} className="flex-1 min-w-0">
            <NavLink
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors min-h-[52px]",
                  isActive
                    ? "text-primary-dark"
                    : "text-ink-soft active:text-ink",
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="truncate w-full text-center px-0.5 leading-tight">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
