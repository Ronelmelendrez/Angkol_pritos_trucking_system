-- products table

CREATE TABLE products (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  default_price     numeric(10,2) NOT NULL,
  unit              text NOT NULL,
  is_active         boolean NOT NULL DEFAULT true,
  reorder_threshold int,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON products FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON products FOR DELETE USING (auth.role() = 'authenticated');
