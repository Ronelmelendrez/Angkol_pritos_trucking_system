-- Widen quantity columns from int to numeric.
--
-- The forms for expenses (stock tracking), stock adjustments, order items
-- and sales all accept decimal input (step="0.01"), so fractional values such
-- as 10.5 kg were rejected with:
--   invalid input syntax for type integer: "10.5"
--
-- numeric(12,3) keeps up to three decimal places, enough for weight-based
-- poultry quantities while still staying well inside the range.

ALTER TABLE stock_adjustments
  ALTER COLUMN quantity TYPE numeric(12,3) USING quantity::numeric;

ALTER TABLE expenses
  ALTER COLUMN quantity_purchased TYPE numeric(12,3) USING quantity_purchased::numeric;

ALTER TABLE order_items
  ALTER COLUMN quantity TYPE numeric(12,3) USING quantity::numeric;

ALTER TABLE sales
  ALTER COLUMN quantity_sold TYPE numeric(12,3) USING quantity_sold::numeric;
