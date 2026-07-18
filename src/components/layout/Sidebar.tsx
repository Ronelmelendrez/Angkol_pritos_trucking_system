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
  PanelLeftClose,
  PanelLeftOpen,
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
  const { isSidebarOpen, closeSidebar, isSidebarCollapsed, toggleCollapse } = useUiStore();

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
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-line bg-surface transition-all duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          isSidebarCollapsed ? "w-[4.5rem]" : "w-64",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center px-4 py-5">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
              <Drumstick className="h-5 w-5" />
            </div>
            {!isSidebarCollapsed && (
              <div className="whitespace-nowrap">
                <p className="stamp text-sm font-semibold leading-tight text-ink">Angkol Prito"s</p>
                <p className="text-[11px] leading-tight text-ink-faint">&amp; Lechon Manok</p>
              </div>
            )}
          </div>
          <button
            onClick={closeSidebar}
            className="ml-auto rounded-full p-1.5 text-ink-soft hover:bg-ink/5 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={closeSidebar}
              title={isSidebarCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isSidebarCollapsed && "justify-center px-2",
                  isActive
                    ? "bg-primary/10 text-primary-dark"
                    : "text-ink-soft hover:bg-ink/5 hover:text-ink"
                )
              }
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              {!isSidebarCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle + footer */}
        <div className="border-t border-line">
          <button
            onClick={toggleCollapse}
            className="hidden w-full items-center gap-3 px-5 py-3 text-sm font-medium text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink lg:flex"
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="h-4.5 w-4.5 shrink-0" />
            ) : (
              <>
                <PanelLeftClose className="h-4.5 w-4.5 shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </button>
          {!isSidebarCollapsed && (
            <div className="border-t border-line px-5 py-4">
              <p className="text-[11px] text-ink-faint">🍗 Fresh daily, served with pride.</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}