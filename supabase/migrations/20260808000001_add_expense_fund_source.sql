CREATE TYPE expense_fund_source AS ENUM ('cash_drawer', 'separate');

ALTER TABLE expenses ADD COLUMN fund_source expense_fund_source;

UPDATE expenses SET fund_source = 'cash_drawer' WHERE payment_method = 'cash' AND fund_source IS NULL;
