-- liquibase formatted sql
-- changeset Mihhail Kohhantsuk:1679057602
CREATE TYPE service_state AS ENUM ('active', 'inactive', 'draft');
ALTER TABLE services DROP COLUMN is_active;
ALTER TABLE services ADD COLUMN current_state service_state DEFAULT 'draft';