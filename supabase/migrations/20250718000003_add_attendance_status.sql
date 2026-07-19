-- Add attendance_status enum and status column to attendance_records.

DO $$ BEGIN
  CREATE TYPE attendance_status AS ENUM ('present', 'absent');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE attendance_records
  ADD COLUMN IF NOT EXISTS status attendance_status DEFAULT NULL;
