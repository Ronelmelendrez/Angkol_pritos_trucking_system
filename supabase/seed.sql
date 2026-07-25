-- ============================================================
-- Angkol Pritos' Trucking System — Seed Data
-- ============================================================

-- ---- Default pay rule settings ----
INSERT INTO pay_rule_settings (id, payday_rules)
VALUES (
  'global',
  '[
    {"frequency": "weekly", "offsetDays": 0, "weekendAdjustment": "none", "fixedWeekday": 5},
    {"frequency": "semi_monthly", "offsetDays": 5, "weekendAdjustment": "move_earlier"},
    {"frequency": "monthly", "offsetDays": 5, "weekendAdjustment": "move_earlier"}
  ]'::jsonb
);

-- ---- Expense categories ----
INSERT INTO categories (name, type) VALUES
  ('Raw Chicken',   'expense'),
  ('Ketchup',       'expense'),
  ('Oil',           'expense'),
  ('Spices',        'expense'),
  ('Packaging',     'expense'),
  ('Fuel',          'expense'),
  ('Repairs',       'expense'),
  ('Salaries',      'expense'),
  ('Flour',         'expense'),
  ('Gus',           'expense'),
  ('Charcoal',      'expense'),
  ('Vinegar',       'expense'),
  ('Ingredients',   'expense');
