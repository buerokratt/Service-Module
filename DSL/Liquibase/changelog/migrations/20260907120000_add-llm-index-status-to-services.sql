-- liquibase formatted sql

ALTER TABLE services
    ADD COLUMN llm_index_status llm_index_status DEFAULT NULL;
