-- liquibase formatted sql
-- changeset athar-mt:20250530230335 ignore:true

BEGIN;

-- 1. Move tables back to public schema
-- services schema
ALTER TABLE IF EXISTS services.services SET SCHEMA public;
ALTER TABLE IF EXISTS services.request_logs SET SCHEMA public;
ALTER TABLE IF EXISTS services.services_settings SET SCHEMA public;

COMMIT;
