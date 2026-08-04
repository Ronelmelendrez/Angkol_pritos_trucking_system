-- Structured reason for manual stock adjustments so spoilage can be
-- reported on separately instead of being parsed from freeform note text.
ALTER TABLE stock_adjustments
  ADD COLUMN reason text NOT NULL DEFAULT 'other'
    CHECK (reason IN ('spoilage', 'waste', 'theft', 'recount', 'other'));

CREATE INDEX idx_stock_adj_reason ON stock_adjustments(reason);
