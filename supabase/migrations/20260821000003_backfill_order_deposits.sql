-- Backfill deposit payment records for existing orders that have a deposit_amount > 0
-- but no corresponding deposit payment yet
INSERT INTO scheduled_order_payments (order_id, payment_type, amount, payment_date, created_by, created_at)
SELECT
  o.id,
  'deposit',
  o.deposit_amount,
  o.date,
  o.created_by,
  o.created_at
FROM orders o
WHERE o.deposit_amount > 0
  AND o.status != 'cancelled'
  AND NOT EXISTS (
    SELECT 1 FROM scheduled_order_payments p
    WHERE p.order_id = o.id
      AND p.payment_type = 'deposit'
  );
