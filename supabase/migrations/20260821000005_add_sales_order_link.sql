-- Link sale rows to the scheduled order they came from.
-- ON DELETE CASCADE: deleting an order also removes its derived sale rows
-- so reports stay clean when test/mistake orders are removed.
ALTER TABLE sales ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES orders(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_sales_order_id ON sales(order_id);

-- Backfill: orders completed before this link existed get their sale rows,
-- dated the order's pick-up date (that is when the sale was fulfilled).
INSERT INTO sales (date, product_id, quantity_sold, unit_price, amount, notes, order_id)
SELECT
  o.date,
  i.product_id,
  i.quantity,
  i.unit_price,
  i.amount,
  'Scheduled order ' || COALESCE(o.order_number, o.id::text),
  o.id
FROM orders o
JOIN order_items i ON i.order_id = o.id
WHERE o.status = 'completed'
  AND NOT EXISTS (
    SELECT 1 FROM sales s WHERE s.order_id = o.id
  );
