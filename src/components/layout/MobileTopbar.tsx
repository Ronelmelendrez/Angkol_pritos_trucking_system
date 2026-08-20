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
  X,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useUiStore } from "@/app/store/useUiStore";
import { useAuth } from "@/features/auth/hooks/useAuth";

const MANAGER_NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dashboard/sales", label: "Sales", icon: ShoppingCart },
  { to: "/dashboard/products", label: "Products", icon: Package },
  { to: "/dashboard/expenses", label: "Expenses", icon: Receipt },
  { to: "/dashboard/inventory", label: "Inventory", icon: ClipboardList },
  { to: "/dashboard/employees", label: "Employees", icon: Users },
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

export function MobileTopbar() {
  const { isSidebarOpen, closeSidebar } = useUiStore();
  const { user } = useAuth();

  const navItems = user?.role === "staff" ? EMPLOYEE_NAV_ITEMS : MANAGER_NAV_ITEMS;

  return (
    <div className="lg:hidden">
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-ink/40 backdrop-blur-[1px] transition-opacity duration-300",
          isSidebarOpen
            ? "opacity-100"
            : "pointer-events-none opacity-0",
        )}
        onClick={closeSidebar}
        aria-hidden
      />

      {/* Floating panel */}
      <div
        className={cn(
          "fixed inset-x-0 top-0 z-50 origin-top transition-all duration-300 ease-out",
          isSidebarOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0",
        )}
      >
        <div className="mx-auto max-w-lg rounded-b-2xl border-b border-line bg-surface shadow-lg">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-sm font-medium text-ink">Navigation</p>
            <button
              onClick={closeSidebar}
              className="rounded-lg p-1.5 text-ink-soft hover:bg-ink/5"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <nav className="max-h-[60vh] overflow-y-auto px-2 py-2">
            <div className="grid grid-cols-3 gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    cn(
                      "flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center text-xs font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary-dark"
                        : "text-ink-soft hover:bg-ink/5 hover:text-ink",
                    )
                  }
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className="leading-tight">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
