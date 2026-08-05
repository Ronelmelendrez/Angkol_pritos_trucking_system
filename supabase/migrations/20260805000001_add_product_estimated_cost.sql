-- Adds an optional per-unit cost estimate for products so the Spoilage
-- report can price losses for items that have no linked purchase history.
ALTER TABLE products ADD COLUMN estimated_cost_per_unit numeric(10,2);
