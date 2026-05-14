-- liquibase formatted sql

CREATE TYPE llm_index_status AS ENUM ('SUCCESS', 'IN_PROGRESS', 'FAILED');

ALTER TABLE endpoints
    ADD COLUMN llm_index_status llm_index_status DEFAULT NULL;
