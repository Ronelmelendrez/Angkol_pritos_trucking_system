-- Adds an "owner consumption" reason so stock the owner takes for
-- personal/family use is recorded as its own loss reason.
ALTER TABLE stock_adjustments
  DROP CONSTRAINT IF EXISTS stock_adjustments_reason_check;

ALTER TABLE stock_adjustments
  ADD CONSTRAINT stock_adjustments_reason_check
  CHECK (reason IN ('spoilage', 'waste', 'theft', 'recount', 'other', 'owner_consumption'));
