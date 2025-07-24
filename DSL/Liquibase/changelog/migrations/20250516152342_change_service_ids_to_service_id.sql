-- liquibase formatted sql
-- changeset IgorKrupenja:20250516152342

-- Drop the existing index on service_ids array
DROP INDEX IF EXISTS idx_endpoints_service_ids;

-- Add new column service_id as UUID
ALTER TABLE endpoints ADD COLUMN service_id UUID;

-- Drop the old service_ids column
ALTER TABLE endpoints DROP COLUMN service_ids;

-- Make service_id NOT NULL after data migration
ALTER TABLE endpoints ALTER COLUMN service_id SET NOT NULL;

-- Create new index on service_id
CREATE INDEX idx_endpoints_service_id ON endpoints (service_id); 