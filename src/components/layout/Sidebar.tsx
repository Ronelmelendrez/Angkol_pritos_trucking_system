import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  ShoppingCart,
  Package,
  ClipboardList,
  Users,
  CalendarClock,
  HandCoins,
  Landmark,
  DollarSign,
  BarChart3,
  Settings,
  Drumstick,
  X,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useUiStore } from "@/app/store/useUiStore";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dashboard/sales", label: "Sales", icon: ShoppingCart },
  { to: "/dashboard/products", label: "Products", icon: Package },
  { to: "/dashboard/expenses", label: "Expenses", icon: Receipt },
  { to: "/dashboard/inventory", label: "Inventory", icon: ClipboardList },
  { to: "/dashboard/employees", label: "Employees", icon: Users },
  { to: "/dashboard/attendance", label: "Attendance", icon: CalendarClock },
  { to: "/dashboard/advances", label: "Cash Advances", icon: HandCoins },
  { to: "/dashboard/loans", label: "Loans (Utang)", icon: Landmark },
  { to: "/dashboard/payroll", label: "Payroll", icon: DollarSign },
  { to: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const { isSidebarOpen, closeSidebar } = useUiStore();

  return (
    <>
      {/* Backdrop overlay — all screen sizes when open */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-ink/40 backdrop-blur-[1px] transition-opacity duration-300",
          isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeSidebar}
        aria-hidden
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-line bg-surface transition-all duration-300 ease-out",
          /* Mobile: compact overlay */
          "w-60 md:w-64",
          /* Desktop: sticky sidebar */
          "md:sticky md:top-0 md:h-screen md:translate-x-0",
          /* Slide: hidden off-screen on mobile when closed */
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between px-4 py-4 md:py-5">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
              <Drumstick className="h-5 w-5" />
            </div>
            <div className="whitespace-nowrap">
              <p className="stamp text-sm font-semibold leading-tight text-ink">Angkol Prito"s</p>
              <p className="text-[11px] leading-tight text-ink-faint">&amp; Lechon Manok</p>
            </div>
          </div>
          <button
            onClick={closeSidebar}
            className="rounded-lg p-2 text-ink-soft hover:bg-ink/5 md:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav items — icon + label always visible */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={closeSidebar}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  "min-h-[44px]",
                  isActive
                    ? "bg-primary/10 text-primary-dark"
                    : "text-ink-soft hover:bg-ink/5 hover:text-ink active:bg-ink/8",
                )
              }
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              <span className="whitespace-nowrap">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer tagline */}
        <div className="border-t border-line px-5 py-4">
          <p className="text-[11px] text-ink-faint">🍗 Fresh daily, served with pride.</p>
        </div>
      </aside>
    </>
  );
}
