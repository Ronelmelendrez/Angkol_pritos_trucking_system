-- payroll_runs table

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

CREATE POLICY "Authenticated read" ON payroll_runs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON payroll_runs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON payroll_runs FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON payroll_runs FOR DELETE USING (auth.role() = 'authenticated');
