-- liquibase formatted sql
-- rollback

ALTER TABLE endpoints
    DROP COLUMN is_llm_synced;
