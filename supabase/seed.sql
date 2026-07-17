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

-- ---- Expense & stock categories ----
INSERT INTO categories (name, type) VALUES
  ('Raw Chicken',   'expense'),
  ('Lechon Manok',  'expense'),
  ('Oil',           'expense'),
  ('Spices',        'expense'),
  ('Packaging',     'expense'),
  ('Fuel',          'expense'),
  ('Repairs',       'expense'),
  ('Salaries',      'expense'),
  ('Misc',          'expense'),
  ('Raw Chicken',   'stock'),
  ('Lechon Manok',  'stock');
