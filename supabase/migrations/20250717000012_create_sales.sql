-- sales table

CREATE TABLE sales (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date          date NOT NULL,
  product_id    uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity_sold int NOT NULL,
  unit_price    numeric(10,2) NOT NULL,
  amount        numeric(12,2) NOT NULL,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER sales_updated_at
  BEFORE UPDATE ON sales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_sales_product_id ON sales(product_id);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON sales FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON sales FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON sales FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON sales FOR DELETE USING (auth.role() = 'authenticated');
