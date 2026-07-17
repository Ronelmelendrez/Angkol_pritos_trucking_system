-- employee_pay_overrides table

CREATE TABLE employee_pay_overrides (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id               uuid NOT NULL UNIQUE REFERENCES employees(id) ON DELETE CASCADE,
  half_day_rate_multiplier  numeric(4,2),
  overtime_rate_multiplier  numeric(4,2),
  late_deduction_per_minute numeric(6,2),
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER employee_pay_overrides_updated_at
  BEFORE UPDATE ON employee_pay_overrides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE employee_pay_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON employee_pay_overrides FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON employee_pay_overrides FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON employee_pay_overrides FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON employee_pay_overrides FOR DELETE USING (auth.role() = 'authenticated');
