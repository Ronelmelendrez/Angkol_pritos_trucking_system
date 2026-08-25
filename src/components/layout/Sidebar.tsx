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
  PiggyBank,
  Coins,
  DollarSign,
  BarChart3,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  ShoppingBag,
  Building2,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useUiStore } from "@/app/store/useUiStore";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Logo } from "@/components/brand/Logo";

const MANAGER_NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dashboard/sales", label: "Sales", icon: ShoppingCart },
  { to: "/dashboard/products", label: "Products", icon: Package },
  { to: "/dashboard/expenses", label: "Expenses", icon: Receipt },
  { to: "/dashboard/inventory", label: "Inventory", icon: ClipboardList },
  { to: "/dashboard/employees", label: "Employees", icon: Users },
  { to: "/dashboard/branches", label: "Branches", icon: Building2 },
  { to: "/dashboard/attendance", label: "Attendance", icon: CalendarClock },
  { to: "/dashboard/advances", label: "Cash Advances", icon: HandCoins },
  { to: "/dashboard/loans", label: "Loans (Utang)", icon: Landmark },
  { to: "/dashboard/cash", label: "Cash Drawer", icon: PiggyBank },
  { to: "/dashboard/withdrawals", label: "Withdrawals", icon: Coins },
  { to: "/dashboard/payroll", label: "Payroll", icon: DollarSign },
  { to: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

const EMPLOYEE_NAV_ITEMS = [
  { to: "/employee", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/employee/orders", label: "Orders", icon: ShoppingBag },
  { to: "/employee/expenses", label: "Expenses", icon: Receipt },
  { to: "/employee/attendance", label: "Attendance", icon: CalendarClock },
  { to: "/employee/advances", label: "Cash Advances", icon: HandCoins },
  { to: "/employee/cash", label: "Cash Drawer", icon: PiggyBank },
];

export function Sidebar() {
  const { isSidebarCollapsed, toggleSidebarCollapse } = useUiStore();
  const { user } = useAuth();

  const navItems = user?.role === "staff" ? EMPLOYEE_NAV_ITEMS : MANAGER_NAV_ITEMS;

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-line bg-surface transition-all duration-300 ease-out",
        "lg:flex lg:sticky lg:top-0 lg:h-screen",
        isSidebarCollapsed ? "lg:w-[4.5rem]" : "lg:w-64",
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center py-4 lg:py-5",
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
          <Logo showText={!isSidebarCollapsed} />
        </div>
      </div>

      {/* Nav items */}
      <nav
        className={cn(
          "flex-1 space-y-1 overflow-y-auto pb-4",
          isSidebarCollapsed ? "px-2" : "px-3",
        )}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
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
        <button
          onClick={toggleSidebarCollapse}
          className={cn(
            "w-full items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-colors",
            "min-h-[44px] text-ink-soft hover:bg-ink/5 hover:text-ink active:bg-ink/8",
            "flex",
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
  );
}
