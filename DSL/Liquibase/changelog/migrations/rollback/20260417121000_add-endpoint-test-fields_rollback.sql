-- liquibase formatted sql
-- rollback

ALTER TABLE endpoints
    DROP COLUMN last_test_at,
    DROP COLUMN verification_status,
    DROP COLUMN last_status_code,
    DROP COLUMN response_schema_captured,
    DROP COLUMN response_schema;
