ALTER TABLE profiles
  ADD COLUMN branch_id uuid REFERENCES branches(id);

CREATE INDEX profiles_branch_id_idx ON profiles(branch_id);