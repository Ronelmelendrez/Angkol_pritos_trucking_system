import {
  LayoutDashboard,
  Receipt,
  ShoppingCart,
  Package,
  ClipboardList,
  Users,
  Clock,
  Wallet,
  Banknote,
  DollarSign,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  path: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/dashboard/sales", label: "Sales", icon: ShoppingCart },
  { path: "/dashboard/products", label: "Products", icon: Package },
  { path: "/dashboard/expenses", label: "Expenses", icon: Receipt },
  { path: "/dashboard/inventory", label: "Inventory", icon: ClipboardList },
  { path: "/dashboard/employees", label: "Employees", icon: Users },
  { path: "/dashboard/attendance", label: "Attendance", icon: Clock },
  { path: "/dashboard/advances", label: "Advances", icon: Wallet },
  { path: "/dashboard/loans", label: "Loans", icon: Banknote },
  { path: "/dashboard/payroll", label: "Payroll", icon: DollarSign },
  { path: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { path: "/dashboard/settings", label: "Settings", icon: Settings },
]