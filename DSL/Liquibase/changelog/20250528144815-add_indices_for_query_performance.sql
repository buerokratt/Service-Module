-- liquibase formatted sql
-- changeset Artsiom Beida:20250528144815 ignore:true

CREATE INDEX IF NOT EXISTS idx_services_service_id ON services(service_id);
CREATE INDEX IF NOT EXISTS idx_services_current_state ON services(current_state) WHERE current_state = 'active';
CREATE INDEX IF NOT EXISTS idx_services_is_common_deleted ON services(deleted, is_common) WHERE NOT deleted AND is_common;