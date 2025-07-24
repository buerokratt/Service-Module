-- liquibase formatted sql
-- changeset IgorKrupenja:20250516152342

DROP INDEX IF EXISTS idx_endpoints_service_ids;

ALTER TABLE endpoints ADD COLUMN service_id UUID;

ALTER TABLE endpoints DROP COLUMN service_ids;

ALTER TABLE endpoints ALTER COLUMN service_id SET NOT NULL;

CREATE INDEX idx_endpoints_service_id ON endpoints (service_id); 