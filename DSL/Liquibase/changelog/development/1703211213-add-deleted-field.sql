-- liquibase formatted sql
-- changeset ahmedyasser:1703211213
ALTER TABLE services
ADD COLUMN deleted BOOLEAN NOT NULL DEFAULT false;
