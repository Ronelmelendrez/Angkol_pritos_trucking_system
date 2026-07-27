-- Add source column to distinguish purchases (from expenses) from manual adjustments (spoilage/waste)
-- Existing rows default to 'adjustment' since they were all manual before
ALTER TABLE stock_adjustments ADD COLUMN source text NOT NULL DEFAULT 'adjustment';

-- Index for filtering by source in ledger queries
CREATE INDEX idx_stock_adj_source ON stock_adjustments(source);
CREATE INDEX idx_stock_adj_product_source ON stock_adjustments(product_id, source);
