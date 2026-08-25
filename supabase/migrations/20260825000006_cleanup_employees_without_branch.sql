-- Clean up any employees without a branch (legacy data)
DELETE FROM employees WHERE branch_id IS NULL;

-- Also clean up any staff profiles without branch_id
UPDATE profiles SET branch_id = NULL WHERE role = 'staff' AND branch_id IS NULL;