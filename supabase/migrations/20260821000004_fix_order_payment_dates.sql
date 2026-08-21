-- Repair: orders scheduled before the payment_date fix stamped the auto-created
-- deposit with the order's pick-up date instead of the day the cash was actually
-- received. Re-derive payment_date from created_at (business local time) for rows
-- where payment_date falls after the real receipt date. Deliberately backdated
-- manual payments (payment_date <= receipt date) are left untouched.
UPDATE scheduled_order_payments
SET payment_date = (created_at AT TIME ZONE 'Asia/Manila')::date
WHERE payment_date > (created_at AT TIME ZONE 'Asia/Manila')::date;
