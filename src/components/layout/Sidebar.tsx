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
  const {
    isSidebarOpen,
    closeSidebar,
    isSidebarCollapsed,
    toggleSidebarCollapse,
  } = useUiStore();

  return (
    <>
      {/* Backdrop overlay — mobile only */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-ink/40 backdrop-blur-[1px] transition-opacity duration-300 md:hidden",
          isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeSidebar}
        aria-hidden
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex shrink-0 flex-col border-r border-line bg-surface transition-all duration-300 ease-out",
          /* Mobile: overlay, full width */
          "w-60",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          /* Desktop: sticky, always visible */
          "md:sticky md:top-0 md:h-screen md:translate-x-0",
          isSidebarCollapsed ? "md:w-[4.5rem]" : "md:w-64",
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center py-4 md:py-5",
            isSidebarCollapsed
              ? "justify-center px-2"
              : "justify-between px-4",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-2.5 overflow-hidden",
              isSidebarCollapsed && "justify-center",
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
              <Drumstick className="h-5 w-5" />
            </div>
            {!isSidebarCollapsed && (
              <div className="whitespace-nowrap">
                <p className="stamp text-sm font-semibold leading-tight text-ink">
                  Angkol Prito"s
                </p>
                <p className="text-[11px] leading-tight text-ink-faint">
                  &amp; Lechon Manok
                </p>
              </div>
            )}
          </div>
          {/* Mobile: close button */}
          <button
            onClick={closeSidebar}
            className="rounded-lg p-2 text-ink-soft hover:bg-ink/5 md:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav
          className={cn(
            "flex-1 space-y-1 overflow-y-auto pb-4",
            isSidebarCollapsed ? "px-2" : "px-3",
          )}
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={closeSidebar}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-colors",
                  "min-h-[44px]",
                  isSidebarCollapsed
                    ? "justify-center px-2"
                    : "px-3",
                  isActive
                    ? "bg-primary/10 text-primary-dark"
                    : "text-ink-soft hover:bg-ink/5 hover:text-ink active:bg-ink/8",
                )
              }
              title={isSidebarCollapsed ? item.label : undefined}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              {!isSidebarCollapsed && (
                <span className="whitespace-nowrap">{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div
          className={cn(
            "border-t border-line pt-2 pb-4",
            isSidebarCollapsed ? "px-2" : "px-3",
          )}
        >
          {/* Desktop: collapse/expand toggle */}
          <button
            onClick={toggleSidebarCollapse}
            className={cn(
              "hidden w-full items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-colors",
              "min-h-[44px] text-ink-soft hover:bg-ink/5 hover:text-ink active:bg-ink/8",
              "md:flex",
              isSidebarCollapsed ? "justify-center px-2" : "px-3",
            )}
            aria-label={
              isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="h-4.5 w-4.5 shrink-0" />
            ) : (
              <PanelLeftClose className="h-4.5 w-4.5 shrink-0" />
            )}
            {!isSidebarCollapsed && (
              <span className="whitespace-nowrap">Collapse</span>
            )}
          </button>
          {!isSidebarCollapsed && (
            <p className="px-3 pt-1 text-[11px] text-ink-faint">
              🍗 Fresh daily, served with pride.
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
