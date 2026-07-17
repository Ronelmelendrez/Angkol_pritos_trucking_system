-- categories table

CREATE TABLE categories (
  id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  type category_type NOT NULL
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON categories FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON categories FOR DELETE USING (auth.role() = 'authenticated');
