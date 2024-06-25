-- liquibase formatted sql
-- changeset ahmedyasser:1701606558
ALTER TABLE services ADD CONSTRAINT services_service_id_key UNIQUE (service_id);
