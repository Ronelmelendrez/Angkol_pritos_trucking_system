-- Consolidate expense categories into a fixed set and re-point
-- existing expenses at the consolidated categories before retiring
-- the old ones (expenses.category_id is ON DELETE RESTRICT).

-- 1) Create the consolidated set.
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

-- 2) Re-point existing expenses at the consolidated categories.
UPDATE expenses SET category_id = new.id
FROM categories old, categories new
WHERE expenses.category_id = old.id
  AND old.type = 'expense'
  AND new.type = 'expense'
  AND (
        (old.name = 'Raw Chicken' AND new.name = 'Raw Materials')
    OR  (old.name IN ('Ketchup', 'Spices', 'Flour', 'Vinegar', 'Ingredients') AND new.name = 'Ingredients')
    OR  (old.name = 'Oil' AND new.name = 'Cooking Supplies')
    OR  (old.name = 'Packaging' AND new.name = 'Packaging Materials')
    OR  (old.name IN ('Fuel', 'Gus', 'Charcoal') AND new.name = 'Fuel & Energy')
    OR  (old.name = 'Repairs' AND new.name = 'Equipment Repairs')
    OR  (old.name = 'Salaries' AND new.name = 'Employee Salaries')
  );

-- 3) Retire the old categories.
DELETE FROM categories
WHERE type = 'expense'
  AND name NOT IN (
    'Raw Materials',
    'Ingredients',
    'Cooking Supplies',
    'Packaging Materials',
    'Fuel & Energy',
    'Employee Salaries',
    'Equipment Repairs',
    'Transportation',
    'Utilities',
    'Cleaning Supplies',
    'Miscellaneous'
  );
