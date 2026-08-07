-- Daily Cash module: owner withdrawals, cash drawer opening, and
-- end-of-day cash count for reconciliation. The report aggregates
-- existing transactions (sales, expenses, cash advances, withdrawals)
-- instead of duplicating them.

-- ── Owner withdrawals ─────────────────────────────────────────
-- Cash taken by the owner for personal use. These are NOT expenses.
CREATE TABLE owner_withdrawals (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date       date NOT NULL,
  amount     numeric(12,2) NOT NULL CHECK (amount >= 0),
  reason     text,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER owner_withdrawals_updated_at
  BEFORE UPDATE ON owner_withdrawals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_owner_withdrawals_date ON owner_withdrawals(date);

ALTER TABLE owner_withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON owner_withdrawals
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON owner_withdrawals
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON owner_withdrawals
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON owner_withdrawals
  FOR DELETE USING (auth.role() = 'authenticated');

-- ── Cash openings ────────────────────────────────────────────
-- One record per business day, recorded when the cashier starts work.
CREATE TABLE cash_openings (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date         date NOT NULL UNIQUE,
  opening_cash numeric(12,2) NOT NULL CHECK (opening_cash >= 0),
  created_by   uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER cash_openings_updated_at
  BEFORE UPDATE ON cash_openings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE cash_openings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON cash_openings
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON cash_openings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON cash_openings
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON cash_openings
  FOR DELETE USING (auth.role() = 'authenticated');

-- ── Cash counts ──────────────────────────────────────────────
-- One record per business day, submitted at closing to reconcile
-- the actual cash against the expected cash.
CREATE TABLE cash_counts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date          date NOT NULL UNIQUE,
  expected_cash numeric(12,2) NOT NULL DEFAULT 0,
  actual_cash   numeric(12,2) NOT NULL CHECK (actual_cash >= 0),
  difference    numeric(12,2) NOT NULL DEFAULT 0,
  remarks       text,
  counted_by    uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER cash_counts_updated_at
  BEFORE UPDATE ON cash_counts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_cash_counts_date ON cash_counts(date);

ALTER TABLE cash_counts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON cash_counts
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON cash_counts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON cash_counts
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON cash_counts
  FOR DELETE USING (auth.role() = 'authenticated');

-- ── Settings: default opening cash ───────────────────────────
ALTER TABLE pay_rule_settings
  ADD COLUMN default_opening_cash numeric(12,2) NOT NULL DEFAULT 0;
