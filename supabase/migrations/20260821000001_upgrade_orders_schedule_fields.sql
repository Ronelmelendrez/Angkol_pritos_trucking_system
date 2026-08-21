-- 1. Add new columns first
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number   text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS contact_number  text NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS deposit_amount  numeric(12,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS balance_amount  numeric(12,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancel_reason   text;

-- 2. Backfill balance_amount for existing rows
UPDATE orders SET balance_amount = total - deposit_amount WHERE balance_amount = 0 AND total > 0;

-- 3. Rebuild the enum safely via a temp column approach
--    a) Add a temp text column
ALTER TABLE orders ADD COLUMN status_new text;

--    b) Copy values, mapping old statuses
UPDATE orders SET status_new = CASE status::text
  WHEN 'pending'    THEN 'scheduled'
  WHEN 'confirmed'  THEN 'scheduled'
  WHEN 'completed'  THEN 'completed'
  WHEN 'cancelled'  THEN 'cancelled'
  ELSE 'scheduled'
END;

--    c) Drop default, drop old column, rename temp
ALTER TABLE orders ALTER COLUMN status DROP DEFAULT;
ALTER TABLE orders DROP COLUMN status;

--    d) Drop old enum and recreate
DROP TYPE order_status;
CREATE TYPE order_status AS ENUM ('scheduled', 'completed', 'cancelled');

--    e) Cast and rename
ALTER TABLE orders ALTER COLUMN status_new TYPE order_status USING status_new::order_status;
ALTER TABLE orders RENAME COLUMN status_new TO status;
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'scheduled';
ALTER TABLE orders ALTER COLUMN status SET NOT NULL;

-- 4. Index for order_number
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
