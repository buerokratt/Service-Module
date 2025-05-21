-- liquibase formatted sql
-- rollback

ALTER TABLE services ADD COLUMN endpoints JSON NOT NULL DEFAULT '[]';
DROP TABLE endpoints;
DROP TYPE ENDPOINT_TYPE;
