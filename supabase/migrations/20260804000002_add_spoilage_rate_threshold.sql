-- Configurable threshold (%) that triggers the spoilage warning banner in
-- Inventory -> Adjustments. Defaults to 5% of purchased stock.
ALTER TABLE pay_rule_settings
  ADD COLUMN spoilage_rate_threshold numeric NOT NULL DEFAULT 5;
