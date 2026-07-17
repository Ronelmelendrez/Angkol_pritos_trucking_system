import { Navigate } from "react-router-dom"
import { useAuth } from "@/features/auth"
import { LoginForm } from "@/features/auth"
import { Drumstick, Receipt, Users, HandCoins, BarChart3, Flame } from "lucide-react"

export function LoginPage() {
  const { user } = useAuth()

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="flex min-h-screen">
      {/* Left — hero, paper / order-ticket stack design */}
      <div className="relative hidden flex-1 overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* warm gradient wash — deeper, richer tones */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-dark via-primary-dark to-ink" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-accent/10" />

        {/* dot-grid pattern, clearly visible */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(230,126,34,0.35) 1.5px, transparent 1.5px)",
            backgroundSize: "26px 26px",
          }}
        />
        {/* warm glow accents */}
        <div className="absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute right-1/3 top-0 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />

        {/* subtle border to separate from form panel */}
        <div className="absolute inset-y-0 right-0 w-px bg-line" />

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-ticket">
            <Drumstick className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="stamp text-sm font-semibold text-white">Angkol Prito"s</p>
            <p className="text-[11px] text-white/60">&amp; Lechon Manok</p>
          </div>
        </div>

        {/* Middle — stacked ticket cards, fanned like receipts */}
        <div className="relative flex flex-1 items-center justify-center py-10">
          <div className="relative h-72 w-full max-w-sm">
            <div className="ticket absolute inset-x-6 top-8 -rotate-6 bg-surface/70 p-5 shadow-ticket" />
            <div className="ticket absolute inset-x-4 top-4 rotate-3 bg-surface/90 p-5 shadow-ticket" />

            <div className="ticket ticket-perf absolute inset-x-0 top-0 space-y-4 p-5">
              <div className="flex items-center justify-between border-b border-dashed border-line pb-3">
                <span className="stamp text-sm font-semibold text-ink">Today's Ticket</span>
                <span className="flex items-center gap-1 text-xs font-medium text-primary">
                  <Flame className="h-3.5 w-3.5" /> Live
                </span>
              </div>
              <TicketRow icon={Receipt} label="Expenses logged" value="12" />
              <TicketRow icon={Users} label="On shift now" value="3 of 4" />
              <TicketRow icon={HandCoins} label="Pending advances" value="₱1,800" />
              <TicketRow icon={BarChart3} label="Net profit today" value="₱16,700" accent />
            </div>
          </div>
        </div>

        {/* Bottom — headline */}
        <div className="relative max-w-md">
          <h2 className="stamp text-3xl font-bold leading-tight text-white">
            Run your truck like<br />clockwork.
          </h2>
          <p className="mt-3 text-sm text-white/70">
            Expenses, attendance, cash advances, and payroll — tracked on one
            ticket, updated the moment it happens.
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="relative flex flex-1 items-center justify-center px-6 py-12">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, rgba(230,126,34,0.25), transparent 45%), radial-gradient(circle at 85% 80%, rgba(192,57,43,0.3), transparent 45%)",
          }}
        />
        <div className="ticket relative w-full max-w-sm bg-surface p-8 shadow-2xl">
          <div className="mb-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-ticket lg:hidden">
              <Drumstick className="h-6 w-6" />
            </div>
            <h1 className="stamp text-2xl font-semibold text-ink">Angkol Prito's</h1>
            <p className="mt-1 text-sm text-ink-soft">Sign in to your account</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}

function TicketRow({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5 text-ink-soft">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary-dark">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className="text-sm">{label}</span>
      </div>
      <span className={`text-sm font-bold ${accent ? "text-primary-dark" : "text-ink"}`}>{value}</span>
    </div>
  )
}