-- liquibase formatted sql
-- rollback

ALTER TABLE endpoints
    DROP COLUMN llm_index_status;

DROP TYPE IF EXISTS llm_index_status;
