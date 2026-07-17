-- stock_adjustments table

CREATE TABLE stock_adjustments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  date        date NOT NULL,
  quantity    int NOT NULL,
  note        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER stock_adjustments_updated_at
  BEFORE UPDATE ON stock_adjustments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_stock_adj_product_id ON stock_adjustments(product_id);
CREATE INDEX idx_stock_adj_date ON stock_adjustments(date);

ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON stock_adjustments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON stock_adjustments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON stock_adjustments FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON stock_adjustments FOR DELETE USING (auth.role() = 'authenticated');
