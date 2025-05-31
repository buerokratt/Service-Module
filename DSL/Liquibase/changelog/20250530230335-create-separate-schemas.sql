-- liquibase formatted sql
-- changeset athar-mt:20250530230335 ignore:true

-- 1. Create schemas
CREATE SCHEMA IF NOT EXISTS services;


-- 2. Move tables to their respective schemas
-- services schema
ALTER TABLE IF EXISTS public.services SET SCHEMA services;
ALTER TABLE IF EXISTS public.request_logs SET SCHEMA services;
ALTER TABLE IF EXISTS public.services_settings SET SCHEMA services;
