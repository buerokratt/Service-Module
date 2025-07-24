-- liquibase formatted sql
-- changeset IgorKrupenja:20250516152342

-- Drop the existing index on service_ids array
DROP INDEX IF EXISTS idx_endpoints_service_ids;

-- Add new column service_id as UUID
ALTER TABLE endpoints ADD COLUMN service_id UUID;

-- Update the new column with the first service_id from the array (assuming we want to keep the first one)
UPDATE endpoints SET service_id = service_ids[1] WHERE array_length(service_ids, 1) > 0;

-- Drop the old service_ids column
ALTER TABLE endpoints DROP COLUMN service_ids;

-- Make service_id NOT NULL after data migration
ALTER TABLE endpoints ALTER COLUMN service_id SET NOT NULL;

-- Create new index on service_id
CREATE INDEX idx_endpoints_service_id ON endpoints (service_id); 