-- liquibase formatted sql
-- rollback

-- Drop the new index on service_id
DROP INDEX IF EXISTS idx_endpoints_service_id;

-- Add back the service_ids column as UUID array
ALTER TABLE endpoints ADD COLUMN service_ids UUID[];

-- Update service_ids array with the single service_id value
UPDATE endpoints SET service_ids = ARRAY[service_id] WHERE service_id IS NOT NULL;

-- Make service_ids NOT NULL after data migration
ALTER TABLE endpoints ALTER COLUMN service_ids SET NOT NULL;

-- Drop the service_id column
ALTER TABLE endpoints DROP COLUMN service_id;

-- Recreate the original index on service_ids array
CREATE INDEX idx_endpoints_service_ids ON endpoints USING gin (service_ids); 