-- liquibase formatted sql
-- changeset ruwini:20260421121000

ALTER TABLE endpoints ALTER COLUMN service_id DROP NOT NULL;
