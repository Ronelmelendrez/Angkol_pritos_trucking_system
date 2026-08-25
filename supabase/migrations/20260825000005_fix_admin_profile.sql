-- Fix missing admin profile
-- Run this if admin user exists in auth.users but not in profiles

INSERT INTO profiles (id, name, email, role, branch_id)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data ->> 'name', split_part(au.email, '@', 1)),
  au.email,
  COALESCE((au.raw_user_meta_data ->> 'role')::user_role, 'manager'),
  NULL
FROM auth.users au
WHERE au.email = 'admin@angkolpritos.com'  -- Change to your admin email
  AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = au.id
  )
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  name = EXCLUDED.name,
  email = EXCLUDED.email;