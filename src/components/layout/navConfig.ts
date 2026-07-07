import {
  LayoutDashboard,
  Receipt,
  ShoppingCart,
  Package,
  Users,
  Clock,
  Wallet,
  Banknote,
  DollarSign,
  BarChart3,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  path: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/sales", label: "Sales", icon: ShoppingCart },
  { path: "/products", label: "Products", icon: Package },
  { path: "/expenses", label: "Expenses", icon: Receipt },
  { path: "/employees", label: "Employees", icon: Users },
  { path: "/attendance", label: "Attendance", icon: Clock },
  { path: "/advances", label: "Advances", icon: Wallet },
  { path: "/loans", label: "Loans", icon: Banknote },
  { path: "/payroll", label: "Payroll", icon: DollarSign },
  { path: "/reports", label: "Reports", icon: BarChart3 },
]