-- liquibase formatted sql
-- rollback

ALTER TABLE services
    DROP COLUMN llm_index_status;
