ALTER TABLE sales
  ADD COLUMN branch_id uuid REFERENCES branches(id);

CREATE INDEX sales_branch_id_idx ON sales(branch_id);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated read" ON sales;
DROP POLICY IF EXISTS "Authenticated insert" ON sales;
DROP POLICY IF EXISTS "Authenticated update" ON sales;
DROP POLICY IF EXISTS "Authenticated delete" ON sales;

CREATE POLICY "Manager read all sales" ON sales
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
  );

CREATE POLICY "Staff read own branch sales" ON sales
  FOR SELECT USING (
    branch_id = (
      SELECT branch_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Manager insert sales" ON sales
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
  );

CREATE POLICY "Staff insert own branch sales" ON sales
  FOR INSERT WITH CHECK (
    branch_id = (
      SELECT branch_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Manager update sales" ON sales
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
  );

CREATE POLICY "Manager delete sales" ON sales
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
  );