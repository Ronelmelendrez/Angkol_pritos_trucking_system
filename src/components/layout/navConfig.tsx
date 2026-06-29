import {
  LayoutDashboard,
  Receipt,
  Users,
  Clock,
  HandCoins,
  Landmark,
  BarChart3,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
  /** Shown in the mobile bottom bar's primary 4 slots */
  primary?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard, primary: true },
  { label: "Attendance", path: "/attendance", icon: Clock, primary: true },
  { label: "Expenses", path: "/expenses", icon: Receipt, primary: true },
  { label: "Reports", path: "/reports", icon: BarChart3, primary: true },
  { label: "Employees", path: "/employees", icon: Users },
  { label: "Advances", path: "/advances", icon: HandCoins },
  { label: "Loans", path: "/loans", icon: Landmark },
]

export const PRIMARY_NAV_ITEMS = NAV_ITEMS.filter((item) => item.primary)
export const SECONDARY_NAV_ITEMS = NAV_ITEMS.filter((item) => !item.primary)