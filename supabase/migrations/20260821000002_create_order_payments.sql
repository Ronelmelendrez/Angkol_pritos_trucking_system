CREATE TYPE order_payment_type AS ENUM ('deposit', 'final', 'extra');

CREATE TABLE scheduled_order_payments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_type  order_payment_type NOT NULL,
  amount        numeric(12,2) NOT NULL,
  payment_date  date NOT NULL,
  notes         text,
  created_by    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_scheduled_order_payments_order_id ON scheduled_order_payments(order_id);
CREATE INDEX idx_scheduled_order_payments_payment_date ON scheduled_order_payments(payment_date);

ALTER TABLE scheduled_order_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON scheduled_order_payments
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON scheduled_order_payments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON scheduled_order_payments
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON scheduled_order_payments
  FOR DELETE USING (auth.role() = 'authenticated');
