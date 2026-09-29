-- Chicken parts management: master conversion configurations.
--
-- A conversion describes how one whole chicken (the "base unit") breaks down
-- into sellable parts. Base weight is deliberately not hard-coded to 1 kg so a
-- 0.65 kg small chicken can be configured with the same part counts.
--
-- Parts live in a child table rather than as wings/legs/breast/neck columns so
-- new parts (thigh, drumstick, liver, gizzard, feet, tail) can be added later
-- without a schema change.

CREATE TABLE chicken_part_conversions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL CHECK (length(trim(name)) > 0),
  base_weight_kg  numeric(10,3) NOT NULL CHECK (base_weight_kg > 0),
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_chicken_conversions_active_name
  ON chicken_part_conversions (lower(name)) WHERE is_active;

CREATE TRIGGER chicken_part_conversions_updated_at
  BEFORE UPDATE ON chicken_part_conversions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Parts belonging to a conversion ─────────────────────────
-- quantity_per_base is how many of this part one base unit yields.
-- price_per_piece is what one piece of this part sells for.
CREATE TABLE chicken_part_conversion_items (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversion_id       uuid NOT NULL REFERENCES chicken_part_conversions(id) ON DELETE CASCADE,
  part_name           text NOT NULL CHECK (length(trim(part_name)) > 0),
  quantity_per_base   numeric(10,3) NOT NULL DEFAULT 0 CHECK (quantity_per_base >= 0),
  price_per_piece     numeric(12,2) NOT NULL DEFAULT 0 CHECK (price_per_piece >= 0),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_chicken_conv_items_conversion
  ON chicken_part_conversion_items (conversion_id);

-- A conversion cannot list the same part twice.
CREATE UNIQUE INDEX idx_chicken_conv_items_unique_part
  ON chicken_part_conversion_items (conversion_id, lower(part_name));

CREATE TRIGGER chicken_part_conversion_items_updated_at
  BEFORE UPDATE ON chicken_part_conversion_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── RLS ────────────────────────────────────────────────────
ALTER TABLE chicken_part_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chicken_part_conversion_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON chicken_part_conversions
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Manager insert" ON chicken_part_conversions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
  );
CREATE POLICY "Manager update" ON chicken_part_conversions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
  );
CREATE POLICY "Manager delete" ON chicken_part_conversions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
  );

CREATE POLICY "Authenticated read" ON chicken_part_conversion_items
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Manager insert" ON chicken_part_conversion_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
  );
CREATE POLICY "Manager update" ON chicken_part_conversion_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
  );
CREATE POLICY "Manager delete" ON chicken_part_conversion_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
  );
