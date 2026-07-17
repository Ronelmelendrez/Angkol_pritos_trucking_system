-- repayments table

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

CREATE POLICY "Authenticated read" ON repayments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON repayments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON repayments FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON repayments FOR DELETE USING (auth.role() = 'authenticated');
