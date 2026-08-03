# Angkol Prito's Trucking System

Internal operations system for **Angkol Prito's & Lechon Manok** — one dashboard for everything the truck needs day to day: sales, expenses, crew attendance, cash advances, utang (loans), inventory, payroll, and reports.

Built mobile-first, since the people using it are on their feet, not behind a computer. Every module reads from and feeds into the others, so the numbers always tie out.

---

## Modules

| Module | Route | What it does |
| --- | --- | --- |
| Dashboard | `/dashboard` | Today at a glance: sales, expenses, attendance, advances, and net profit with period comparisons and sparklines |
| Sales | `/dashboard/sales` | Record every sale by product and quantity; daily totals flow into reports |
| Products | `/dashboard/products` | Master list of everything the truck sells — price, category, and what it costs to make |
| Expenses | `/dashboard/expenses` | Raw chicken, oil, fuel, packaging, repairs — logged by category, supplier, and payment method |
| Inventory | `/dashboard/inventory` | Daily stock ledger per product, low-stock warnings, stock adjustments, and reports |
| Employees | `/dashboard/employees` | Directory with contact info, daily rate, hire date, active status, and per-employee pay overrides |
| Attendance | `/dashboard/attendance` | Clock in/out from any phone; hours worked feed directly into payroll. Supports full-day/half-day shifts and manual entry |
| Advances | `/dashboard/advances` | Record a cash advance the moment it's given; auto-deducted from the next payout, auto-cleaned up after 5 days once deducted |
| Loans (utang) | `/dashboard/loans` | Track principal, remaining balance, and every repayment per employee |
| Payroll | `/dashboard/payroll` | Weekly / semi-monthly / monthly — hours × rate, minus advance and loan deductions, with a locked paid history |
| Reports | `/dashboard/reports` | Sales vs. expenses over time, spending by category, payroll summaries, and profit charts |
| Settings | `/dashboard/settings` | Company profile, work schedules, and the payroll rules (payday, half-day thresholds, overtime, deductions) that drive the whole system |

---

## Tech stack

- **Frontend**: React 19, TypeScript, Vite 8
- **UI**: shadcn/ui components (`src/components/ui`) built on Radix UI primitives + Tailwind CSS v4 + `class-variance-authority`, customized with a brand theme
- **Data**: Supabase (Postgres) with a typed client, TanStack Query, Zustand (UI state)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts, custom sparklines/heatmaps
- **Dates**: date-fns
- **Routing**: React Router v7
- **Deployment**: Vercel (SPA rewrites)

## Project structure

```
src/
  app/                    # Providers, router, routes/pages
  components/
    layout/               # App shell, sidebar, mobile nav, header
    ui/                   # Badge, Button, Card, Dialog, Table, etc.
    charts/               # Sparkline, heatmap, trend badges
  features/
    <module>/             # Feature-based structure
      components/         # Feature UI
      hooks/              # Data-fetching / mutations (TanStack Query)
      types/              # Feature types
      utils/              # Feature helpers
  lib/                    # Supabase client, mappers, constants
  utils/                  # Date, currency, chart helpers
  types/                  # Generated Supabase database types
supabase/
  migrations/             # SQL schema + RPC migrations
  seed.sql                # Default pay rules + expense categories
scripts/
  seed-admin.ts           # Creates the initial manager account
```

## Getting started

### 1. Prerequisites

- Node.js 20+
- A Supabase project (or the Supabase CLI for local dev)

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Only needed for CLI operations (migrations, seed, etc.)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Seed admin credentials (used by npm run seed:admin)
SEED_ADMIN_EMAIL=admin@angkolpritos.com
SEED_ADMIN_PASSWORD=changeme
```

### 4. Set up the database

Apply the migrations:

```bash
supabase db push
```

Then seed the default settings and expense categories:

```bash
supabase db seed
```

### 5. Run the app

```bash
npm run dev
```

### 6. Create the manager account (once)

```bash
npm run seed:admin
```

This creates (or updates) the admin user with the `manager` role so you can sign in.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) then build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build |
| `npm run seed:admin` | Create/update the manager admin account |

---

## Key concepts

### Payroll flow

1. Attendance is clocked in/out from a phone (full-day or half-day shift).
2. The payroll screen builds draft rows per employee: hours × rate, minus selected cash-advance deductions and loan deductions, plus optional adjustments.
3. Confirming pay calls the `pay_payroll_run` database RPC, which finalizes the run, marks advances as `deducted`, records loan repayments/expenses, and locks the paid history.
4. Deducted cash advances are automatically removed from the system after 5 days.

### Database

Core tables: `employees`, `profiles`, `products`, `categories`, `attendance_records`, `expenses`, `cash_advances`, `loans`, `repayments`, `sales`, `stock_adjustments`, `payroll_runs`, `pay_rule_settings`, `employee_pay_overrides`.

Schema is defined in `supabase/migrations/` and typed in `src/types/database.types.ts` (generated from the live Supabase schema).

---

## Deployment

The app is a static SPA deployed to Vercel. `vercel.json` rewrites all routes to `index.html` so client-side routing works on refresh.

```bash
npm run build
vercel --prod
```
