CREATE TABLE categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  type       category_type NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(name, type)
);

CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON categories
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON categories
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON categories
  FOR DELETE USING (auth.role() = 'authenticated');
