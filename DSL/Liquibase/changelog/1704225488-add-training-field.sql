-- liquibase formatted sql
-- changeset ahmedyasser:1704225488
ALTER TABLE services
ADD COLUMN needs_training BOOLEAN NOT NULL DEFAULT true;
