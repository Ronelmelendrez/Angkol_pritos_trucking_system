import { Receipt, Clock, HandCoins, PiggyBank, ShoppingBag } from "lucide-react"
import { Link } from "react-router-dom"
import { Card } from "@/components/ui/Card"
import { useAuth } from "@/features/auth/hooks/useAuth"

const QUICK_LINKS = [
  { to: "/employee/orders", label: "New Order", desc: "Create and track orders", icon: ShoppingBag, color: "bg-indigo-100 text-indigo-600" },
  { to: "/employee/expenses", label: "Add Expense", desc: "Log a new business expense", icon: Receipt, color: "bg-orange-100 text-orange-600" },
  { to: "/employee/attendance", label: "Attendance", desc: "Clock in/out and view records", icon: Clock, color: "bg-blue-100 text-blue-600" },
  { to: "/employee/advances", label: "Cash Advances", desc: "Request or view advances", icon: HandCoins, color: "bg-green-100 text-green-600" },
  { to: "/employee/cash", label: "Cash Drawer", desc: "Set opening cash", icon: PiggyBank, color: "bg-purple-100 text-purple-600" },
]

export function EmployeeDashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="stamp text-2xl font-bold text-ink">Welcome, {user?.name ?? "Employee"}</h1>
        <p className="mt-1 text-sm text-ink-soft">Here's what you can do today.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {QUICK_LINKS.map((link) => {
          const Icon = link.icon
          return (
            <Link key={link.to} to={link.to}>
              <Card className="flex items-center gap-4 p-5 transition-colors hover:border-primary/30 hover:bg-primary/[0.02]">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${link.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{link.label}</p>
                  <p className="text-xs text-ink-faint">{link.desc}</p>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
