-- Migration: Add branch_id to cash drawer, expenses, and owner withdrawals
-- This makes the cash drawer and daily cash report branch-aware.

-- ── 1. Find or create a default branch for backfilling ─────────
DO $$
DECLARE
  default_branch_id uuid;
BEGIN
  -- Try to get the first (oldest) active branch
  SELECT id INTO default_branch_id
  FROM branches
  WHERE is_active = true
  ORDER BY created_at ASC
  LIMIT 1;

  -- If no branch exists, create a default one
  IF default_branch_id IS NULL THEN
    INSERT INTO branches (name, is_active)
    VALUES ('Main Branch', true)
    RETURNING id INTO default_branch_id;
  END IF;

  -- Store it in a temporary table so subsequent blocks can use it
  CREATE TEMP TABLE IF NOT EXISTS _migration_defaults (
    key text PRIMARY KEY,
    value uuid
  ) ON COMMIT DROP;
  INSERT INTO _migration_defaults (key, value) VALUES ('default_branch', default_branch_id);
END $$;

-- ── 2. Drop old UNIQUE constraints on date ────────────────────
ALTER TABLE cash_openings DROP CONSTRAINT IF EXISTS cash_openings_date_key;
ALTER TABLE cash_counts   DROP CONSTRAINT IF EXISTS cash_counts_date_key;

-- ── 3. Add branch_id columns ──────────────────────────────────
ALTER TABLE cash_openings     ADD COLUMN branch_id uuid;
ALTER TABLE cash_counts       ADD COLUMN branch_id uuid;
ALTER TABLE expenses          ADD COLUMN branch_id uuid;
ALTER TABLE owner_withdrawals ADD COLUMN branch_id uuid;

-- ── 4. Backfill existing rows with the default branch ─────────
DO $$
DECLARE
  default_branch_id uuid;
BEGIN
  SELECT value INTO default_branch_id FROM _migration_defaults WHERE key = 'default_branch';

  UPDATE cash_openings     SET branch_id = default_branch_id WHERE branch_id IS NULL;
  UPDATE cash_counts       SET branch_id = default_branch_id WHERE branch_id IS NULL;
  UPDATE expenses          SET branch_id = default_branch_id WHERE branch_id IS NULL;
  UPDATE owner_withdrawals SET branch_id = default_branch_id WHERE branch_id IS NULL;
END $$;

-- ── 5. Add NOT NULL constraints ───────────────────────────────
ALTER TABLE cash_openings     ALTER COLUMN branch_id SET NOT NULL;
ALTER TABLE cash_counts       ALTER COLUMN branch_id SET NOT NULL;
ALTER TABLE expenses          ALTER COLUMN branch_id SET NOT NULL;
ALTER TABLE owner_withdrawals ALTER COLUMN branch_id SET NOT NULL;

-- ── 6. Add FK constraints ─────────────────────────────────────
ALTER TABLE cash_openings
  ADD CONSTRAINT cash_openings_branch_id_fkey
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT;

ALTER TABLE cash_counts
  ADD CONSTRAINT cash_counts_branch_id_fkey
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT;

ALTER TABLE expenses
  ADD CONSTRAINT expenses_branch_id_fkey
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT;

ALTER TABLE owner_withdrawals
  ADD CONSTRAINT owner_withdrawals_branch_id_fkey
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT;

-- ── 7. Unique constraints: one per branch per date ────────────
ALTER TABLE cash_openings ADD CONSTRAINT cash_openings_date_branch_unique UNIQUE (date, branch_id);
ALTER TABLE cash_counts   ADD CONSTRAINT cash_counts_date_branch_unique UNIQUE (date, branch_id);

-- ── 8. Performance indexes ────────────────────────────────────
CREATE INDEX idx_cash_openings_branch_id      ON cash_openings(branch_id);
CREATE INDEX idx_cash_counts_branch_id        ON cash_counts(branch_id);
CREATE INDEX idx_expenses_branch_id           ON expenses(branch_id);
CREATE INDEX idx_owner_withdrawals_branch_id  ON owner_withdrawals(branch_id);

-- ── 9. Replace RLS policies with branch-aware policies ────────

-- cash_openings
DROP POLICY IF EXISTS "Authenticated read"   ON cash_openings;
DROP POLICY IF EXISTS "Authenticated insert" ON cash_openings;
DROP POLICY IF EXISTS "Authenticated update" ON cash_openings;
DROP POLICY IF EXISTS "Authenticated delete" ON cash_openings;

CREATE POLICY "Branch read" ON cash_openings FOR SELECT USING (
  branch_id IN (SELECT branch_id FROM profiles WHERE id = auth.uid())
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'manager'
);
CREATE POLICY "Branch insert" ON cash_openings FOR INSERT WITH CHECK (
  branch_id IN (SELECT branch_id FROM profiles WHERE id = auth.uid())
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'manager'
);
CREATE POLICY "Branch update" ON cash_openings FOR UPDATE USING (
  branch_id IN (SELECT branch_id FROM profiles WHERE id = auth.uid())
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'manager'
);
CREATE POLICY "Branch delete" ON cash_openings FOR DELETE USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'manager'
);

-- cash_counts
DROP POLICY IF EXISTS "Authenticated read"   ON cash_counts;
DROP POLICY IF EXISTS "Authenticated insert" ON cash_counts;
DROP POLICY IF EXISTS "Authenticated update" ON cash_counts;
DROP POLICY IF EXISTS "Authenticated delete" ON cash_counts;

CREATE POLICY "Branch read" ON cash_counts FOR SELECT USING (
  branch_id IN (SELECT branch_id FROM profiles WHERE id = auth.uid())
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'manager'
);
CREATE POLICY "Branch insert" ON cash_counts FOR INSERT WITH CHECK (
  branch_id IN (SELECT branch_id FROM profiles WHERE id = auth.uid())
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'manager'
);
CREATE POLICY "Branch update" ON cash_counts FOR UPDATE USING (
  branch_id IN (SELECT branch_id FROM profiles WHERE id = auth.uid())
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'manager'
);
CREATE POLICY "Branch delete" ON cash_counts FOR DELETE USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'manager'
);

-- expenses
DROP POLICY IF EXISTS "Authenticated read"   ON expenses;
DROP POLICY IF EXISTS "Authenticated insert" ON expenses;
DROP POLICY IF EXISTS "Authenticated update" ON expenses;
DROP POLICY IF EXISTS "Authenticated delete" ON expenses;

CREATE POLICY "Branch read" ON expenses FOR SELECT USING (
  branch_id IN (SELECT branch_id FROM profiles WHERE id = auth.uid())
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'manager'
);
CREATE POLICY "Branch insert" ON expenses FOR INSERT WITH CHECK (
  branch_id IN (SELECT branch_id FROM profiles WHERE id = auth.uid())
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'manager'
);
CREATE POLICY "Branch update" ON expenses FOR UPDATE USING (
  branch_id IN (SELECT branch_id FROM profiles WHERE id = auth.uid())
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'manager'
);
CREATE POLICY "Branch delete" ON expenses FOR DELETE USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'manager'
);

-- owner_withdrawals
DROP POLICY IF EXISTS "Authenticated read"   ON owner_withdrawals;
DROP POLICY IF EXISTS "Authenticated insert" ON owner_withdrawals;
DROP POLICY IF EXISTS "Authenticated update" ON owner_withdrawals;
DROP POLICY IF EXISTS "Authenticated delete" ON owner_withdrawals;

CREATE POLICY "Branch read" ON owner_withdrawals FOR SELECT USING (
  branch_id IN (SELECT branch_id FROM profiles WHERE id = auth.uid())
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'manager'
);
CREATE POLICY "Branch insert" ON owner_withdrawals FOR INSERT WITH CHECK (
  branch_id IN (SELECT branch_id FROM profiles WHERE id = auth.uid())
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'manager'
);
CREATE POLICY "Branch update" ON owner_withdrawals FOR UPDATE USING (
  branch_id IN (SELECT branch_id FROM profiles WHERE id = auth.uid())
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'manager'
);
CREATE POLICY "Branch delete" ON owner_withdrawals FOR DELETE USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'manager'
);

-- ── 10. Cleanup ───────────────────────────────────────────────
DROP TABLE IF EXISTS _migration_defaults;
