-- liquibase formatted sql
-- changeset IgorKrupenja:1740988965
ALTER TABLE services ADD COLUMN slot TEXT NOT NULL DEFAULT '';
