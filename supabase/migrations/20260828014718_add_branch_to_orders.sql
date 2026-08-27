ALTER TABLE orders
  ADD COLUMN branch_id uuid REFERENCES branches(id);

CREATE INDEX orders_branch_id_idx ON orders(branch_id);

DROP POLICY IF EXISTS "Authenticated read" ON orders;
DROP POLICY IF EXISTS "Authenticated insert" ON orders;
DROP POLICY IF EXISTS "Authenticated update" ON orders;
DROP POLICY IF EXISTS "Authenticated delete" ON orders;

CREATE POLICY "Manager read all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
  );

CREATE POLICY "Staff read own branch orders" ON orders
  FOR SELECT USING (
    branch_id = (
      SELECT branch_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Authenticated insert orders" ON orders
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Authenticated update orders" ON orders
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete orders" ON orders
  FOR DELETE USING (auth.role() = 'authenticated');
