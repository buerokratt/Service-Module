-- liquibase formatted sql
-- changeset ahmedyasser:1704225457
ALTER TABLE services
ADD COLUMN needs_training BOOLEAN NOT NULL DEFAULT false;
