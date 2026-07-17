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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const FEATURES = [
  { icon: Receipt, title: "Expense tracking", desc: "Log daily purchases by category, supplier, and payment method — see totals instantly." },
  { icon: Users, title: "Employee management", desc: "Keep your crew's contact info, rates, and hire dates in one directory." },
  { icon: CalendarClock, title: "Attendance", desc: "Tap-to-clock in/out on any phone, with a full history and monthly calendar view." },
  { icon: HandCoins, title: "Cash advances", desc: "Record advances and auto-deduct them from the next payroll run." },
  { icon: Landmark, title: "Loans (utang)", desc: "Track balances and repayments per employee, down to the last peso." },
  { icon: Boxes, title: "Inventory", desc: "A daily stock ledger per product — leftover quantity rolls into the next day automatically." },
  { icon: Wallet, title: "Payroll", desc: "Weekly, semi-monthly, or monthly pay periods with hours, deductions, and adjustments." },
  { icon: BarChart3, title: "Reports", desc: "Sales vs. expenses trends, category breakdowns, and payroll summaries at a glance." },
];

const HIGHLIGHTS = [
  "Works on any phone your staff already carries",
  "No backend required to start — your data stays on your device",
  "Built to plug into a real database later, with zero rework",
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
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
          <Button asChild size="sm">
            <Link to="/login">
              Sign in <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(62,39,35,0.06) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-16 top-32 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary-dark">
              <Flame className="h-3.5 w-3.5" /> Built for food truck operations
            </div>
            <h1 className="stamp text-4xl font-bold leading-tight text-ink sm:text-5xl">
              Run your fried chicken &amp; lechon manok business without the spreadsheet chaos
            </h1>
            <p className="mt-5 text-lg text-ink-soft">
              Track expenses, attendance, cash advances, loans, and payroll — all
              from one dashboard, built to run smoothly through your busiest
              lunch rush.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/login">
                  Get started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#features">See what it does</a>
              </Button>
            </div>
          </div>

          {/* Floating preview ticket */}
          <div className="relative mx-auto mt-16 max-w-md">
            <div className="ticket absolute inset-x-6 top-6 -rotate-3 bg-surface/70 p-5" />
            <div className="ticket ticket-perf relative space-y-4 p-5">
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
      </section>

      {/* Feature grid */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="mx-auto mb-12 max-w-xl text-center">
          <h2 className="stamp text-3xl font-bold text-ink">Everything the truck needs, in one place</h2>
          <p className="mt-3 text-ink-soft">
            No separate notebooks for expenses, attendance, and utang — one system, updated the moment it happens.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <Card key={f.title} className="ticket-hover">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary-dark">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="stamp mb-1 text-base font-semibold text-ink">{f.title}</h3>
              <p className="text-sm text-ink-soft">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Highlights band */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-4xl px-6 py-14 text-center">
          <h2 className="stamp text-2xl font-bold text-ink">Built to grow with your business</h2>
          <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-4 text-left sm:grid-cols-1">
            {HIGHLIGHTS.map((h) => (
              <div key={h} className="flex items-start gap-3 rounded-xl border border-line bg-bg px-4 py-3">
                <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-success" />
                <span className="text-sm text-ink">{h}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="stamp text-3xl font-bold text-ink">Ready to run a tighter operation?</h2>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">
          Sign in with your manager account and start logging today's expenses in under a minute.
        </p>
        <Button asChild size="lg" className="mt-7">
          <Link to="/login">
            Sign in to your dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-line px-6 py-8 text-center text-xs text-ink-faint">
        🍗 Manong's Grill &amp; Lechon Manok — fresh daily, served with pride.
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