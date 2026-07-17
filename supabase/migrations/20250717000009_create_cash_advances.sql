-- cash_advances table

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

ALTER TABLE cash_advances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON cash_advances FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON cash_advances FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON cash_advances FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON cash_advances FOR DELETE USING (auth.role() = 'authenticated');
