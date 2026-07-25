-- Backfill profiles for any auth.users rows that lack a profiles row.
-- This happens when the trigger was not active at user creation time.
INSERT INTO public.profiles (id, name, email, role)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data ->> 'name', split_part(au.email, '@', 1)),
  au.email,
  COALESCE((au.raw_user_meta_data ->> 'role')::user_role, 'staff')
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;
