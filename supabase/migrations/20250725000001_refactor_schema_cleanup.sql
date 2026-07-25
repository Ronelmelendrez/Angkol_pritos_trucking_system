-- ============================================================
-- Schema cleanup migration
-- Consolidates: removes overtime, adds missing columns/indexes,
-- tightens constraints, and aligns schema with refactored code.
-- ============================================================

-- 1. Remove overtime_rate_multiplier (system does not use overtime)
ALTER TABLE pay_rule_settings DROP COLUMN IF EXISTS overtime_rate_multiplier;
ALTER TABLE employee_pay_overrides DROP COLUMN IF EXISTS overtime_rate_multiplier;

-- 2. Add created_at / updated_at to categories (consistency with all other tables)
DO $$
BEGIN
  ALTER TABLE categories ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE categories ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3. Add singleton guard to pay_rule_settings
DO $$
BEGIN
  ALTER TABLE pay_rule_settings
    ADD CONSTRAINT pay_rule_settings_singleton CHECK (id = 'global');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4. Remove DELETE policy on pay_rule_settings (singleton must not be deletable)
DROP POLICY IF EXISTS "Authenticated delete" ON pay_rule_settings;

-- 5. Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_expenses_date_category ON expenses(date, category_id);
CREATE INDEX IF NOT EXISTS idx_cash_advances_employee_date ON cash_advances(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_sales_date_product ON sales(date, product_id);
CREATE INDEX IF NOT EXISTS idx_stock_adj_product_date ON stock_adjustments(product_id, date);

-- 6. Explicit ON DELETE for expenses.category_id (safety: prevent category deletion with linked expenses)
DO $$
BEGIN
  ALTER TABLE expenses
    DROP CONSTRAINT expenses_category_id_fkey;
  ALTER TABLE expenses
    ADD CONSTRAINT expenses_category_id_fkey
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;
