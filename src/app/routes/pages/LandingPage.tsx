import { Link } from "react-router-dom";
import {
  Drumstick,
  Receipt,
  Users,
  CalendarClock,
  HandCoins,
  Landmark,
  BarChart3,
  Boxes,
  Wallet,
  ArrowRight,
  CheckCircle2,
  Flame,
  X,
  Layers,
  Database,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const MODULES = [
  { icon: Receipt, title: "Expenses", desc: "Every purchase — raw chicken, oil, fuel, packaging, repairs — logged by category, supplier, and payment method." },
  { icon: Users, title: "Employees", desc: "One directory: contact info, hourly rate, hire date, active status for everyone on the crew." },
  { icon: CalendarClock, title: "Attendance", desc: "Clock in/out from any phone. Hours worked feed directly into payroll — no manual timesheets." },
  { icon: HandCoins, title: "Cash advances", desc: "Record an advance the moment it's given, and deduct it automatically from the next payout." },
  { icon: Landmark, title: "Loans (utang)", desc: "Track principal, remaining balance, and every repayment per employee, over time." },
  { icon: Boxes, title: "Inventory", desc: "A running daily stock ledger per product. What's left over today opens tomorrow's count automatically." },
  { icon: Wallet, title: "Payroll", desc: "Weekly, semi-monthly, or monthly — hours × rate, minus advances and loan deductions, with a locked paid history." },
  { icon: BarChart3, title: "Reports", desc: "Sales vs. expenses over time, spending by category, and payroll summaries in one dashboard." },
];

const BEFORE_AFTER = [
  { before: "Expenses split across notebooks, receipts, and someone's memory", after: "Every peso logged in one place, categorized and searchable" },
  { before: "Attendance tracked on paper, hours tallied by hand at payday", after: "Clock in/out on a phone; hours flow straight into payroll" },
  { before: "Cash advances and utang easy to lose track of", after: "Balances update the moment an advance or repayment is logged" },
  { before: "No real sense of profit until the end of the month", after: "Sales vs. expenses visible day by day, not just in hindsight" },
];

const BUILD_NOTES = [
  { icon: Layers, title: "Frontend-first", desc: "Fully usable today on mock data — nothing to install or configure to start logging real operations." },
  { icon: Database, title: "Built to connect later", desc: "The data layer is structured so a real database (Supabase/Postgres) can be dropped in without rebuilding the app." },
  { icon: Smartphone, title: "Made for the truck, not a desk", desc: "Every screen is designed mobile-first, since the people using it are on their feet, not behind a computer." },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-ticket">
              <Drumstick className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="stamp text-sm font-semibold text-ink">Manong's Grill</p>
              <p className="text-[11px] text-ink-faint">&amp; Lechon Manok</p>
            </div>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#about" className="text-sm font-medium text-ink-soft transition-colors hover:text-ink">About</a>
            <a href="#modules" className="text-sm font-medium text-ink-soft transition-colors hover:text-ink">What's inside</a>
            <a href="#how-its-built" className="text-sm font-medium text-ink-soft transition-colors hover:text-ink">How it's built</a>
          </nav>
          <Button asChild size="sm">
            <Link to="/login">
              Sign in <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero — introduces the system, not a sales pitch */}
      <section className="relative overflow-hidden bg-ink">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-dark via-primary-dark to-ink" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-accent/10" />
        <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="grid items-center gap-12 sm:grid-cols-2">
            {/* Left — copy */}
            <div className="text-center sm:text-left">
              <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-white ring-1 ring-white/20 backdrop-blur-sm sm:mx-0">
                <Flame className="h-3.5 w-3.5 text-accent" /> Internal operations system
              </div>
              <h1 className="stamp text-4xl font-bold leading-tight text-white sm:text-5xl">
                The system that runs Manong's Grill &amp; Lechon Manok
              </h1>
              <p className="mt-5 text-lg text-white/75">
                One dashboard for everything the truck needs day to day — expenses,
                crew attendance, cash advances, utang, inventory, and payroll.
                Built specifically for how this business actually operates.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-start">
                <Button asChild size="lg">
                  <Link to="/login">
                    Open the dashboard <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                >
                  <a href="#about">What is this?</a>
                </Button>
              </div>
            </div>

            {/* Right — floating preview ticket */}
            <div className="relative mx-auto w-full max-w-[460px]">
              <div className="ticket absolute inset-x-6 top-6 -rotate-3 bg-surface/60 p-5 shadow-2xl" />
              <div className="ticket ticket-perf relative w-full space-y-4 p-5 shadow-2xl">
                <div className="flex items-center justify-between border-b border-dashed border-line pb-3">
                  <span className="stamp text-sm font-semibold text-ink">Today's Ticket</span>
                  <span className="flex items-center gap-1 text-xs font-medium text-primary">
                    <Flame className="h-3.5 w-3.5" /> Live
                  </span>
                </div>
                <PreviewRow icon={Receipt} label="Expenses logged" value="12" />
                <PreviewRow icon={Users} label="On shift now" value="3 of 4" />
                <PreviewRow icon={HandCoins} label="Pending advances" value="₱1,800" />
                <PreviewRow icon={BarChart3} label="Net profit today" value="₱16,700" accent />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About the system */}
      <section id="about" className="mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
        <h2 className="stamp text-3xl font-bold text-ink sm:text-4xl">What this system is</h2>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">
          Manong's Grill &amp; Lechon Manok runs on a food truck, on a tight
          schedule, with a small crew doing everything from cooking to cash
          handling. This system exists to replace the scattered notebooks,
          text-message reminders, and end-of-month guesswork with one place
          where every expense, shift, advance, and utang gets recorded the
          moment it happens — and stays there, searchable, for as long as it's
          needed.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">
          It isn't a generic point-of-sale or accounting product. Every module
          was built around how this specific truck operates: no inventory
          quantities on the expense side by default, cash advances that tie
          straight into payroll, and utang that tracks down to the peso.
        </p>
      </section>

      {/* Before / after */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <div className="mx-auto mb-12 max-w-xl text-center">
            <h2 className="stamp text-3xl font-bold text-ink">What it changes day to day</h2>
          </div>
          <div className="space-y-3">
            {BEFORE_AFTER.map((row) => (
              <div key={row.before} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-xl border border-line bg-bg px-4 py-3">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                  <span className="text-sm text-ink-soft">{row.before}</span>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-line bg-bg px-4 py-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span className="text-sm text-ink">{row.after}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules — what's inside */}
      <section id="modules" className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="mx-auto mb-12 max-w-xl text-center">
          <h2 className="stamp text-3xl font-bold text-ink sm:text-4xl">What's inside the system</h2>
          <p className="mt-3 text-ink-soft">
            Eight modules, all reading from and feeding into each other.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((m) => (
            <Card key={m.title} className="group ticket-hover">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary-dark transition-colors group-hover:bg-primary group-hover:text-white">
                <m.icon className="h-5 w-5" />
              </div>
              <h3 className="stamp mb-1 text-base font-semibold text-ink">{m.title}</h3>
              <p className="text-sm text-ink-soft">{m.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it's built */}
      <section id="how-its-built" className="border-y border-line bg-surface">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
          <div className="mx-auto mb-12 max-w-xl text-center">
            <h2 className="stamp text-3xl font-bold text-ink sm:text-4xl">How it's built</h2>
            <p className="mt-3 text-ink-soft">For anyone curious what's actually running under the hood.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {BUILD_NOTES.map((note) => (
              <div key={note.title} className="rounded-2xl border border-line bg-bg p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary-dark">
                  <note.icon className="h-5 w-5" />
                </div>
                <h3 className="stamp mb-2 text-base font-semibold text-ink">{note.title}</h3>
                <p className="text-sm text-ink-soft">{note.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h2 className="stamp text-3xl font-bold text-ink">Ready to log today's operations?</h2>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">
          Sign in with the manager account to start tracking expenses, attendance, and everything else.
        </p>
        <Button asChild size="lg" className="mt-7">
          <Link to="/login">
            Sign in to the dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>

      {/* Simple footer */}
      <footer className="border-t border-line px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white">
              <Drumstick className="h-3.5 w-3.5" />
            </div>
            <p className="text-xs text-ink-faint">
              Manong's Grill &amp; Lechon Manok — internal operations system, built for one truck.
            </p>
          </div>
          <p className="text-xs text-ink-faint">© {new Date().getFullYear()} — fresh daily, served with pride.</p>
        </div>
      </footer>
    </div>
  );
}

function PreviewRow({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent?: boolean;
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
  );
}