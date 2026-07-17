-- loans table

CREATE TABLE loans (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id       uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  principal         numeric(12,2) NOT NULL,
  interest_rate     numeric(5,2) NOT NULL DEFAULT 0,
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

CREATE POLICY "Authenticated read" ON loans FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON loans FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON loans FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON loans FOR DELETE USING (auth.role() = 'authenticated');
