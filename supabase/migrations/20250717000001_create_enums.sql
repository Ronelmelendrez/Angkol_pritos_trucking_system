-- Create all enum types

CREATE TYPE user_role AS ENUM ('manager', 'staff');
CREATE TYPE pay_frequency AS ENUM ('weekly', 'semi_monthly', 'monthly');
CREATE TYPE shift_type AS ENUM ('full', 'half');
CREATE TYPE advance_status AS ENUM ('pending', 'deducted');
CREATE TYPE loan_status AS ENUM ('active', 'paid');
CREATE TYPE payroll_status AS ENUM ('upcoming', 'ready', 'paid');
CREATE TYPE payment_method AS ENUM ('cash', 'gcash', 'bank_transfer', 'credit');
CREATE TYPE absence_deduction_mode AS ENUM ('full_day', 'none');
CREATE TYPE weekend_adjustment AS ENUM ('none', 'move_earlier', 'move_later');
CREATE TYPE category_type AS ENUM ('expense', 'stock');
