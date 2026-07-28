-- ============================================================
-- CLEAN REBUILD: Drop everything and re-create from scratch.
-- This is a destructive migration — all data will be lost.
-- ============================================================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS employee_pay_overrides CASCADE;
DROP TABLE IF EXISTS payroll_runs CASCADE;
DROP TABLE IF EXISTS repayments CASCADE;
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS cash_advances CASCADE;
DROP TABLE IF EXISTS stock_adjustments CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS pay_rule_settings CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS employees CASCADE;

-- Drop triggers on auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop all enum types
DROP TYPE IF EXISTS attendance_status CASCADE;
DROP TYPE IF EXISTS category_type CASCADE;
DROP TYPE IF EXISTS weekend_adjustment CASCADE;
DROP TYPE IF EXISTS absence_deduction_mode CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS payroll_status CASCADE;
DROP TYPE IF EXISTS loan_status CASCADE;
DROP TYPE IF EXISTS advance_status CASCADE;
DROP TYPE IF EXISTS shift_type CASCADE;
DROP TYPE IF EXISTS pay_frequency CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Drop helper function
DROP FUNCTION IF EXISTS update_updated_at();

-- ============================================================
-- REBUILD: All enums
-- ============================================================
CREATE TYPE user_role AS ENUM ('manager', 'staff');
CREATE TYPE pay_frequency AS ENUM ('weekly', 'semi_monthly', 'monthly');
CREATE TYPE shift_type AS ENUM ('full', 'half');
CREATE TYPE attendance_status AS ENUM ('present', 'absent');
CREATE TYPE advance_status AS ENUM ('pending', 'deducted');
CREATE TYPE loan_status AS ENUM ('active', 'paid');
CREATE TYPE payroll_status AS ENUM ('upcoming', 'ready', 'paid');
CREATE TYPE payment_method AS ENUM ('cash', 'gcash', 'bank_transfer', 'credit');
CREATE TYPE absence_deduction_mode AS ENUM ('full_day', 'none');
CREATE TYPE weekend_adjustment AS ENUM ('none', 'move_earlier', 'move_later');
CREATE TYPE category_type AS ENUM ('expense', 'stock');

-- ============================================================
-- REBUILD: Trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- REBUILD: employees
-- ============================================================
CREATE TABLE employees (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  phone         text,
  daily_rate    numeric(10,2) NOT NULL,
  hire_date     date NOT NULL,
  is_active     boolean NOT NULL DEFAULT true,
  avatar_color  text,
  pay_frequency pay_frequency NOT NULL DEFAULT 'semi_monthly',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON employees
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON employees
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON employees
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON employees
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- REBUILD: profiles + auth trigger
-- ============================================================
CREATE TABLE profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  email      text NOT NULL,
  role       user_role NOT NULL DEFAULT 'staff',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_profiles_email ON profiles(email);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'staff')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- REBUILD: products
-- ============================================================
CREATE TABLE products (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  default_price     numeric(10,2) NOT NULL,
  unit              text NOT NULL,
  is_active         boolean NOT NULL DEFAULT true,
  reorder_threshold int,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON products
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON products
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON products
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- REBUILD: categories
-- ============================================================
CREATE TABLE categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  type       category_type NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(name, type)
);

CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON categories
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON categories
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON categories
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- REBUILD: attendance_records
-- ============================================================
CREATE TABLE attendance_records (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id  uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date         date NOT NULL,
  clock_in     timestamptz,
  clock_out    timestamptz,
  hours_worked numeric(5,2),
  shift        shift_type,
  status       attendance_status DEFAULT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(employee_id, date)
);

CREATE TRIGGER attendance_records_updated_at
  BEFORE UPDATE ON attendance_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_attendance_date ON attendance_records(date);

ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON attendance_records
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON attendance_records
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON attendance_records
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON attendance_records
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- REBUILD: expenses
-- ============================================================
CREATE TABLE expenses (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date               date NOT NULL,
  category_id        uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  description        text,
  amount             numeric(12,2) NOT NULL,
  supplier           text,
  payment_method     payment_method NOT NULL,
  product_id         uuid REFERENCES products(id) ON DELETE SET NULL,
  quantity_purchased int,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_category_id ON expenses(category_id);
CREATE INDEX idx_expenses_product_id ON expenses(product_id);
CREATE INDEX idx_expenses_date_category ON expenses(date, category_id);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON expenses
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON expenses
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON expenses
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON expenses
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- REBUILD: cash_advances
-- ============================================================
CREATE TABLE cash_advances (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  amount      numeric(10,2) NOT NULL,
  date        date NOT NULL,
  status      advance_status NOT NULL DEFAULT 'pending',
  reason      text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER cash_advances_updated_at
  BEFORE UPDATE ON cash_advances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_cash_advances_employee_id ON cash_advances(employee_id);
CREATE INDEX idx_cash_advances_date ON cash_advances(date);
CREATE INDEX idx_cash_advances_employee_date ON cash_advances(employee_id, date);

ALTER TABLE cash_advances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON cash_advances
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON cash_advances
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON cash_advances
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON cash_advances
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- REBUILD: loans
-- ============================================================
CREATE TABLE loans (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id       uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  principal         numeric(12,2) NOT NULL,
  remaining_balance numeric(12,2) NOT NULL,
  date_issued       date NOT NULL,
  status            loan_status NOT NULL DEFAULT 'active',
  notes             text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER loans_updated_at
  BEFORE UPDATE ON loans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_loans_employee_id ON loans(employee_id);
CREATE INDEX idx_loans_status ON loans(status);

ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON loans
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON loans
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON loans
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON loans
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- REBUILD: repayments
-- ============================================================
CREATE TABLE repayments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id    uuid NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  amount     numeric(10,2) NOT NULL,
  date       date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER repayments_updated_at
  BEFORE UPDATE ON repayments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_repayments_loan_id ON repayments(loan_id);

ALTER TABLE repayments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON repayments
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON repayments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON repayments
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON repayments
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- REBUILD: sales
-- ============================================================
CREATE TABLE sales (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date          date NOT NULL,
  product_id    uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity_sold int NOT NULL,
  unit_price    numeric(10,2) NOT NULL,
  amount        numeric(12,2) NOT NULL,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER sales_updated_at
  BEFORE UPDATE ON sales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_sales_product_id ON sales(product_id);
CREATE INDEX idx_sales_date_product ON sales(date, product_id);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON sales
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON sales
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON sales
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON sales
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- REBUILD: stock_adjustments
-- ============================================================
CREATE TABLE stock_adjustments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  date       date NOT NULL,
  quantity   int NOT NULL,
  note       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER stock_adjustments_updated_at
  BEFORE UPDATE ON stock_adjustments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_stock_adj_product_id ON stock_adjustments(product_id);
CREATE INDEX idx_stock_adj_date ON stock_adjustments(date);
CREATE INDEX idx_stock_adj_product_date ON stock_adjustments(product_id, date);

ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON stock_adjustments
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON stock_adjustments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON stock_adjustments
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON stock_adjustments
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- REBUILD: payroll_runs
-- ============================================================
CREATE TABLE payroll_runs (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id         uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  period_start        date NOT NULL,
  period_end          date NOT NULL,
  hours_worked        numeric(7,2) NOT NULL,
  daily_rate          numeric(10,2) NOT NULL,
  gross_pay           numeric(12,2) NOT NULL,
  advance_deductions  numeric(12,2) NOT NULL DEFAULT 0,
  loan_deductions     numeric(12,2) NOT NULL DEFAULT 0,
  adjustments         numeric(12,2) NOT NULL DEFAULT 0,
  adjustment_note     text,
  net_pay             numeric(12,2) NOT NULL,
  status              payroll_status NOT NULL DEFAULT 'upcoming',
  paid_at             timestamptz,
  advance_ids         jsonb NOT NULL DEFAULT '[]'::jsonb,
  loan_id             uuid REFERENCES loans(id) ON DELETE SET NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER payroll_runs_updated_at
  BEFORE UPDATE ON payroll_runs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_payroll_employee_id ON payroll_runs(employee_id);
CREATE INDEX idx_payroll_status ON payroll_runs(status);
CREATE INDEX idx_payroll_period ON payroll_runs(period_start, period_end);

ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON payroll_runs
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON payroll_runs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON payroll_runs
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON payroll_runs
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- REBUILD: pay_rule_settings (singleton)
-- ============================================================
CREATE TABLE pay_rule_settings (
  id                         text PRIMARY KEY DEFAULT 'global',
  default_reorder_threshold  int NOT NULL DEFAULT 5,
  standard_hours_per_day     numeric(4,2) NOT NULL DEFAULT 8,
  half_day_threshold_hours   numeric(4,2) NOT NULL DEFAULT 4,
  half_day_rate_multiplier   numeric(4,2) NOT NULL DEFAULT 0.5,
  late_grace_minutes         int NOT NULL DEFAULT 10,
  late_deduction_per_minute  numeric(6,2) NOT NULL DEFAULT 0,
  absence_deduction_mode     absence_deduction_mode NOT NULL DEFAULT 'full_day',
  rest_day_rate_multiplier   numeric(4,2) NOT NULL DEFAULT 1.3,
  holiday_rate_multiplier    numeric(4,2) NOT NULL DEFAULT 2.0,
  night_differential_percent numeric(5,2) NOT NULL DEFAULT 10,
  round_hours_to             numeric(3,2) NOT NULL DEFAULT 0.25,
  payday_rules               jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at                 timestamptz NOT NULL DEFAULT now(),
  updated_at                 timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pay_rule_settings_singleton CHECK (id = 'global')
);

CREATE TRIGGER pay_rule_settings_updated_at
  BEFORE UPDATE ON pay_rule_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE pay_rule_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON pay_rule_settings
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON pay_rule_settings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON pay_rule_settings
  FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================================
-- REBUILD: employee_pay_overrides
-- ============================================================
CREATE TABLE employee_pay_overrides (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id               uuid NOT NULL UNIQUE REFERENCES employees(id) ON DELETE CASCADE,
  half_day_rate_multiplier  numeric(4,2),
  late_deduction_per_minute numeric(6,2),
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER employee_pay_overrides_updated_at
  BEFORE UPDATE ON employee_pay_overrides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE employee_pay_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON employee_pay_overrides
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON employee_pay_overrides
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON employee_pay_overrides
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON employee_pay_overrides
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- SEED: Default pay rule settings
-- ============================================================
INSERT INTO pay_rule_settings (id, payday_rules)
VALUES (
  'global',
  '[
    {"frequency": "weekly", "offsetDays": 0, "weekendAdjustment": "none", "fixedWeekday": 5},
    {"frequency": "semi_monthly", "offsetDays": 0, "weekendAdjustment": "none"},
    {"frequency": "monthly", "offsetDays": 0, "weekendAdjustment": "none"}
  ]'::jsonb
);

-- ============================================================
-- SEED: Expense categories (must match src/lib/constants.ts)
-- ============================================================
INSERT INTO categories (name, type) VALUES
  ('Raw Chicken',   'expense'),
  ('Ketchup',       'expense'),
  ('Oil',           'expense'),
  ('Spices',        'expense'),
  ('Packaging',     'expense'),
  ('Fuel',          'expense'),
  ('Repairs',       'expense'),
  ('Salaries',      'expense'),
  ('Flour',         'expense'),
  ('Gus',           'expense'),
  ('Charcoal',      'expense'),
  ('Vinegar',       'expense'),
  ('Ingredients',   'expense');
