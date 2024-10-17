-- liquibase formatted sql
-- changeset baha-a:1704956597
ALTER TABLE services
ADD COLUMN endpoints JSON NOT NULL DEFAULT '[]';
