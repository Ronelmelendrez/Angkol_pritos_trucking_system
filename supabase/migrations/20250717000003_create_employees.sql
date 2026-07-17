-- employees table

CREATE TABLE employees (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  phone        text,
  daily_rate   numeric(10,2) NOT NULL,
  hire_date    date NOT NULL,
  is_active    boolean NOT NULL DEFAULT true,
  avatar_color text,
  pay_frequency pay_frequency NOT NULL DEFAULT 'semi_monthly',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON employees FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON employees FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON employees FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON employees FOR DELETE USING (auth.role() = 'authenticated');
