-- expenses table

CREATE TABLE expenses (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date               date NOT NULL,
  category_id        uuid NOT NULL REFERENCES categories(id),
  description        text,
  amount             numeric(12,2) NOT NULL,
  supplier           text,
  payment_method     payment_method NOT NULL,
  product_id         uuid REFERENCES products(id) ON DELETE SET NULL,
  quantity_purchased int,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_category_id ON expenses(category_id);
CREATE INDEX idx_expenses_product_id ON expenses(product_id);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON expenses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON expenses FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON expenses FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON expenses FOR DELETE USING (auth.role() = 'authenticated');
