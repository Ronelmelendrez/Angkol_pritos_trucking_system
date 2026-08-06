-- ============================================================
-- Angkol Pritos' Trucking System — Seed Data
-- ============================================================

-- ---- Default pay rule settings ----
INSERT INTO pay_rule_settings (id, payday_rules)
VALUES (
  'global',
  '[
    {"frequency": "weekly", "offsetDays": 0, "weekendAdjustment": "none", "fixedWeekday": 5},
    {"frequency": "semi_monthly", "offsetDays": 0, "weekendAdjustment": "none"},
    {"frequency": "monthly", "offsetDays": 0, "weekendAdjustment": "none"}
  ]'::jsonb
);

-- ---- Expense categories ----
INSERT INTO categories (name, type) VALUES
  ('Raw Materials',        'expense'),
  ('Ingredients',          'expense'),
  ('Cooking Supplies',     'expense'),
  ('Packaging Materials',  'expense'),
  ('Fuel & Energy',        'expense'),
  ('Employee Salaries',    'expense'),
  ('Equipment Repairs',    'expense'),
  ('Transportation',       'expense'),
  ('Utilities',            'expense'),
  ('Cleaning Supplies',    'expense'),
  ('Miscellaneous',        'expense')
ON CONFLICT (name, type) DO NOTHING;
