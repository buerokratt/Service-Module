-- liquibase formatted sql
-- rollback

ALTER TABLE services ADD COLUMN endpoints JSON NOT NULL DEFAULT '[]';
DROP TYPE ENDPOINT_TYPE;
DROP TABLE endpoints;
