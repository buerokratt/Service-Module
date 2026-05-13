-- liquibase formatted sql

ALTER TABLE endpoints
    ADD COLUMN is_llm_synced BOOLEAN DEFAULT NULL;
