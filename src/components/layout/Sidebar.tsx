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
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/sales", label: "Sales", icon: ShoppingCart },
  { to: "/products", label: "Products", icon: Package },
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "/inventory", label: "Inventory", icon: ClipboardList },
  { to: "/employees", label: "Employees", icon: Users },
  { to: "/attendance", label: "Attendance", icon: CalendarClock },
  { to: "/advances", label: "Cash Advances", icon: HandCoins },
  { to: "/loans", label: "Loans (Utang)", icon: Landmark },
  { to: "/payroll", label: "Payroll", icon: DollarSign },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const { isSidebarOpen, closeSidebar } = useUiStore();

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-[1px] lg:hidden"
          onClick={closeSidebar}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-surface transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
              <Drumstick className="h-5 w-5" />
            </div>
            <div>
              <p className="stamp text-sm font-semibold leading-tight text-ink">Angkol Prito"s</p>
              <p className="text-[11px] leading-tight text-ink-faint">&amp; Lechon Manok</p>
            </div>
          </div>
          <button
            onClick={closeSidebar}
            className="rounded-full p-1.5 text-ink-soft hover:bg-ink/5 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

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
                  isActive
                    ? "bg-primary/10 text-primary-dark"
                    : "text-ink-soft hover:bg-ink/5 hover:text-ink"
                )
              }
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-line px-5 py-4">
          <p className="text-[11px] text-ink-faint">🍗 Fresh daily, served with pride.</p>
        </div>
      </aside>
    </>
  );
}