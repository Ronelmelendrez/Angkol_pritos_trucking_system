-- pay_rule_settings table (singleton)

CREATE TABLE pay_rule_settings (
  id                         text PRIMARY KEY DEFAULT 'global',
  default_reorder_threshold  int NOT NULL DEFAULT 5,
  standard_hours_per_day     numeric(4,2) NOT NULL DEFAULT 8,
  half_day_threshold_hours   numeric(4,2) NOT NULL DEFAULT 4,
  half_day_rate_multiplier   numeric(4,2) NOT NULL DEFAULT 0.5,
  overtime_rate_multiplier   numeric(4,2) NOT NULL DEFAULT 1.25,
  late_grace_minutes         int NOT NULL DEFAULT 10,
  late_deduction_per_minute  numeric(6,2) NOT NULL DEFAULT 0,
  absence_deduction_mode     absence_deduction_mode NOT NULL DEFAULT 'full_day',
  rest_day_rate_multiplier   numeric(4,2) NOT NULL DEFAULT 1.3,
  holiday_rate_multiplier    numeric(4,2) NOT NULL DEFAULT 2.0,
  night_differential_percent numeric(5,2) NOT NULL DEFAULT 10,
  round_hours_to             numeric(3,2) NOT NULL DEFAULT 0.25,
  payday_rules               jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at                 timestamptz NOT NULL DEFAULT now(),
  updated_at                 timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER pay_rule_settings_updated_at
  BEFORE UPDATE ON pay_rule_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE pay_rule_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON pay_rule_settings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON pay_rule_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON pay_rule_settings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON pay_rule_settings FOR DELETE USING (auth.role() = 'authenticated');
