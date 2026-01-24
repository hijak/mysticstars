-- Migration: Add new reading types (love, career, health) and luckyInfluences column
-- This migration adds support for the new reading categories and lucky influences

-- Step 1: Add new enum values to reading_type enum
-- Note: PostgreSQL doesn't support adding values to enum in place,
-- so we need to create a new type and migrate

CREATE TYPE reading_type_enum_new AS ENUM (
  'daily', 'weekly', 'monthly', 'yearly',
  'love', 'career', 'health'
);

-- Alter the column to use the new enum type
ALTER TABLE readings
  ALTER COLUMN "readingType" TYPE reading_type_enum_new
  USING '"readingType"'::text::reading_type_enum_new;

-- Drop the old enum type
DROP TYPE reading_type_enum;

-- Rename the new type to the original name
ALTER TYPE reading_type_enum_new RENAME TO reading_type_enum;

-- Step 2: Add luckyInfluences JSONB column
ALTER TABLE readings
  ADD COLUMN IF NOT EXISTS "luckyInfluences" JSONB
  DEFAULT '{"number": null, "color": null, "time": null}'::jsonb
  CHECK (
    jsonb_typeof("luckyInfluences") = 'object' AND
    ("luckyInfluences'->>'number' IS NULL OR ("luckyInfluences'->>'number') ~ '^[0-9]+$') AND
    ("luckyInfluences'->>'color' IS NULL OR jsonb_typeof("luckyInfluences'->'color') = 'string') AND
    ("luckyInfluences'->>'time' IS NULL OR jsonb_typeof("luckyInfluences'->'time') = 'string')
  );

-- Step 3: Add comment for documentation
COMMENT ON COLUMN readings."luckyInfluences" IS 'Lucky number (1-12), color, and power hour time (generated for daily readings)';

-- Step 4: Create index on readingType for faster queries
CREATE INDEX IF NOT EXISTS idx_readings_reading_type ON readings("readingType");

-- Verification query (run separately to check)
-- SELECT DISTINCT "readingType" FROM readings ORDER BY "readingType";
-- SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'readings';
