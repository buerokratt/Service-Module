-- liquibase formatted sql
-- changeset ahmedyasser:1703210973
ALTER TABLE services
ADD COLUMN is_common BOOLEAN NOT NULL DEFAULT false;
