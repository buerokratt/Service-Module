-- liquibase formatted sql
-- changeset ahmedyasser:1701604912
ALTER TABLE services
ADD COLUMN service_id TEXT NOT NULL;
