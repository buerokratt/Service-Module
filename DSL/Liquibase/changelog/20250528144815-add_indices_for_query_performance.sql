-- liquibase formatted sql
-- changeset Artsiom Beida:20250528144815 ignore:true
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_services_service_id ON services(service_id);
CREATE INDEX IF NOT EXISTS idx_services_current_state ON services(current_state) WHERE current_state = 'active';
CREATE INDEX IF NOT EXISTS idx_services_is_common_deleted ON services(deleted, is_common) WHERE NOT deleted AND is_common;
CREATE INDEX IF NOT EXISTS idx_services_name_trgm ON services USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_services_service_id_updated_at ON services (service_id, updated_at DESC);
