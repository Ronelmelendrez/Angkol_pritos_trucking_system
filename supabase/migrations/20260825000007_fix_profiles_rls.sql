-- Allow service role to update profiles (for Edge Functions)
-- and managers to update staff profiles

-- Drop existing update policy
DROP POLICY IF EXISTS "Users update own profile" ON profiles;

-- Allow users to update their own profile
CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow service role to update any profile (bypasses RLS when using service_role key)
-- Note: service_role key bypasses RLS entirely, but we add this for clarity

-- Allow managers to update staff profiles
CREATE POLICY "Managers update staff profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
    AND role = 'staff'
  );