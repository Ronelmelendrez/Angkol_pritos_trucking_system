ALTER TABLE employees
  ADD COLUMN branch_id uuid REFERENCES branches(id);

CREATE INDEX employees_branch_id_idx ON employees(branch_id);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated read" ON employees;
DROP POLICY IF EXISTS "Authenticated insert" ON employees;
DROP POLICY IF EXISTS "Authenticated update" ON employees;
DROP POLICY IF EXISTS "Authenticated delete" ON employees;

CREATE POLICY "Manager read all employees" ON employees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
  );

CREATE POLICY "Staff read own branch employees" ON employees
  FOR SELECT USING (
    branch_id = (
      SELECT branch_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Manager insert employees" ON employees
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
  );

CREATE POLICY "Manager update employees" ON employees
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
  );

CREATE POLICY "Manager delete employees" ON employees
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
  );