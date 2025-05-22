-- liquibase formatted sql
-- changeset IgorKrupenja:20250516152341

ALTER TABLE services DROP COLUMN endpoints;

CREATE TYPE endpoint_type AS ENUM ('openApi', 'custom');

CREATE TABLE endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_ids UUID [] NOT NULL,
    name TEXT NOT NULL,
    type ENDPOINT_TYPE NOT NULL,
    file_name TEXT NOT NULL,
    is_common BOOLEAN NOT NULL DEFAULT FALSE,
    definitions JSONB NOT NULL DEFAULT '[]',
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT current_timestamp,
    updated_at TIMESTAMP DEFAULT current_timestamp
);

CREATE INDEX idx_endpoints_is_common ON endpoints (is_common);
CREATE INDEX idx_endpoints_service_ids ON endpoints USING gin (service_ids);
CREATE INDEX idx_endpoints_created_at ON endpoints (created_at);
CREATE INDEX idx_endpoints_deleted ON endpoints (deleted);
