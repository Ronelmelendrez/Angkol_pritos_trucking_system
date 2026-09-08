-- Migration: Add tracking_stock flag to expenses
-- Marks whether an expense was recorded with stock tracking (inventory purchases).

ALTER TABLE expenses ADD COLUMN tracking_stock boolean NOT NULL DEFAULT false;

-- Backfill existing stock purchases (those already carrying a product_id)
UPDATE expenses SET tracking_stock = true WHERE product_id IS NOT NULL;