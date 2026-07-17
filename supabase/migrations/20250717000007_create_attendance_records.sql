-- attendance_records table

CREATE TABLE attendance_records (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id  uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date         date NOT NULL,
  clock_in     timestamptz,
  clock_out    timestamptz,
  hours_worked numeric(5,2),
  shift        shift_type,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(employee_id, date)
);

CREATE TRIGGER attendance_records_updated_at
  BEFORE UPDATE ON attendance_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_attendance_employee_id ON attendance_records(employee_id);
CREATE INDEX idx_attendance_date ON attendance_records(date);

ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON attendance_records FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON attendance_records FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON attendance_records FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON attendance_records FOR DELETE USING (auth.role() = 'authenticated');
