-- liquibase formatted sql
-- rollback

DROP TABLE endpoints;
DROP TYPE ENDPOINT_TYPE;
ALTER TABLE services ADD COLUMN endpoints JSON NOT NULL DEFAULT '[]';
