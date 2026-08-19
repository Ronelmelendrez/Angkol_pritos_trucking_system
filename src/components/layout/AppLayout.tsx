import { Outlet, useLocation } from "react-router-dom"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { MobileTopbar } from "@/components/layout/MobileTopbar"
import { MobileBottomNav } from "@/components/layout/MobileBottomNav"
import { useAuth } from "@/features/auth/hooks/useAuth"

const MANAGER_NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/dashboard/sales", label: "Sales" },
  { path: "/dashboard/products", label: "Products" },
  { path: "/dashboard/expenses", label: "Expenses" },
  { path: "/dashboard/inventory", label: "Inventory" },
  { path: "/dashboard/employees", label: "Employees" },
  { path: "/dashboard/attendance", label: "Attendance" },
  { path: "/dashboard/advances", label: "Advances" },
  { path: "/dashboard/loans", label: "Loans" },
  { path: "/dashboard/cash", label: "Cash Drawer" },
  { path: "/dashboard/withdrawals", label: "Withdrawals" },
  { path: "/dashboard/payroll", label: "Payroll" },
  { path: "/dashboard/reports", label: "Reports" },
  { path: "/dashboard/settings", label: "Settings" },
]

const EMPLOYEE_NAV_ITEMS = [
  { path: "/employee", label: "Dashboard" },
  { path: "/employee/expenses", label: "Expenses" },
  { path: "/employee/attendance", label: "Attendance" },
  { path: "/employee/advances", label: "Cash Advances" },
  { path: "/employee/cash", label: "Cash Drawer" },
]

/**
 * Main application layout.
 * - Desktop (lg+): Sidebar (left, sticky) + Header + content area
 * - Mobile/tablet (<lg): MobileTopbar + Header + content area + BottomTabNav
 * Content area has bottom padding on mobile to account for the fixed bottom nav.
 */
export function AppLayout() {
  const location = useLocation()
  const { user } = useAuth()

  const navItems = user?.role === "staff" ? EMPLOYEE_NAV_ITEMS : MANAGER_NAV_ITEMS
  const title = navItems.find((item) => item.path === location.pathname)?.label ?? "Dashboard"

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Sidebar — desktop only */}
      <Sidebar />

      {/* Main content column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile topbar — hidden on lg+ */}
        <MobileTopbar />
        <Header title={title} />

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto px-4 pb-24 pt-4 lg:px-6 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom tab navigation – hidden on lg+ */}
      <MobileBottomNav />
    </div>
  )
}
