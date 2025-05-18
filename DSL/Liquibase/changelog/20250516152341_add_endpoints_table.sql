-- liquibase formatted sql
-- changeset IgorKrupenja:20250516152341 
CREATE TABLE endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_ids UUID [] NOT NULL,
    -- todo varchar or text or wut?
    name VARCHAR(255) NOT NULL,
    -- todo enum?
    type VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    is_common BOOLEAN NOT NULL DEFAULT FALSE,
    definitions JSONB NOT NULL DEFAULT '[]',
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT current_timestamp,
    updated_at TIMESTAMP DEFAULT current_timestamp
);
