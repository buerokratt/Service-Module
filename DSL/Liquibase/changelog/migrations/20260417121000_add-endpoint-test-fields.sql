-- liquibase formatted sql

ALTER TABLE endpoints
    ADD COLUMN last_test_at TIMESTAMPTZ,
    ADD COLUMN verification_status BOOLEAN DEFAULT FALSE,
    ADD COLUMN last_status_code VARCHAR(10),
    ADD COLUMN response_schema_captured BOOLEAN DEFAULT FALSE,
    ADD COLUMN response_schema JSONB NOT NULL DEFAULT '[]';

