-- liquibase formatted sql
-- changeset ahmedyasser:1703824288
ALTER TABLE services
ADD COLUMN structure JSON NOT NULL DEFAULT '{}';
