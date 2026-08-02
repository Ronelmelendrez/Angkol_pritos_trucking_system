import { Navigate, Link } from "react-router-dom"
import { useAuth } from "@/features/auth"
import { LoginForm } from "@/features/auth"
import { Receipt, Users, HandCoins, BarChart3, Flame, ArrowLeft } from "lucide-react"
import { Logo } from "@/components/brand/Logo"

const FEATURES = [
  {
    icon: Receipt,
    title: "Expenses",
    desc: "Categorized, searchable, and tied to stock",
  },
  {
    icon: Users,
    title: "Attendance",
    desc: "Clock in/out from any phone",
  },
  {
    icon: HandCoins,
    title: "Advances & loans",
    desc: "Balances update the moment they're logged",
  },
  {
    icon: BarChart3,
    title: "Payroll & reports",
    desc: "Hours × rate, minus advances and utang",
  },
]

export function LoginPage() {
  const { user } = useAuth()

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="flex min-h-screen">
      {/* Left — brand showcase */}
      <div className="relative hidden flex-1 overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-14">
        {/* background */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-dark via-primary-dark to-ink" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-accent/10" />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* glow orbs */}
        <div className="absolute -left-24 top-1/4 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-accent/25 blur-3xl" />

        {/* header */}
        <div className="relative">
          <Logo tone="glass" size="md" />
        </div>

        {/* middle — copy + features */}
        <div className="relative max-w-lg">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white ring-1 ring-white/20 backdrop-blur-sm">
            <Flame className="h-3.5 w-3.5 text-accent" /> Internal operations system
          </span>
          <h2 className="stamp text-4xl font-bold leading-[1.15] text-white">
            Run your truck like<br />clockwork.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/70">
            Every expense, shift, cash advance, and utang — logged the moment it
            happens, and tied together in one place.
          </p>

          <div className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-3 rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10 backdrop-blur-sm"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-accent">
                  <f.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-white/60">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* bottom — trust strip */}
        <div className="relative flex items-center gap-6 text-white/60">
          <div>
            <p className="stamp text-xl font-bold text-white">8</p>
            <p className="text-xs">modules</p>
          </div>
          <div className="h-8 w-px bg-white/15" />
          <div>
            <p className="stamp text-xl font-bold text-white">1</p>
            <p className="text-xs">dashboard</p>
          </div>
          <div className="h-8 w-px bg-white/15" />
          <div>
            <p className="stamp text-xl font-bold text-white">0</p>
            <p className="text-xs">paper trails</p>
          </div>
        </div>
      </div>

      {/* Right — sign in */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-bg px-6 py-12">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 15%, rgba(230,126,34,0.10), transparent 45%), radial-gradient(circle at 85% 90%, rgba(192,57,43,0.10), transparent 45%)",
          }}
        />

        <div className="relative w-full max-w-md animate-rise">
          {/* mobile brand */}
          <div className="mb-8 flex items-center justify-center lg:hidden">
            <Logo size="md" />
          </div>

          <div className="rounded-3xl border border-line/70 bg-surface/85 p-8 shadow-2xl backdrop-blur-md sm:p-10">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Welcome back</p>
              <h1 className="stamp mt-2 text-3xl font-bold text-ink">Sign in</h1>
              <p className="mt-1.5 text-sm text-ink-soft">
                Log today's expenses, attendance, and sales in minutes.
              </p>
            </div>

            <LoginForm />

            <div className="mt-8 flex items-center gap-3 text-[11px] uppercase tracking-wider text-ink-faint">
              <span className="h-px flex-1 bg-line" />
              For the crew
              <span className="h-px flex-1 bg-line" />
            </div>

            <Link
              to="/"
              className="mt-5 flex items-center justify-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" /> Back to homepage
            </Link>
          </div>

          <p className="mt-6 text-center text-xs text-ink-faint">
            © {new Date().getFullYear()} Angkol Prito's &amp; Lechon Manok
          </p>
        </div>
      </div>
    </div>
  )
}
