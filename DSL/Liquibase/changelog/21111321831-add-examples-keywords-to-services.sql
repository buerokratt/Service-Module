-- liquibase formatted sql
-- changeset VassiliM:21111321831
ALTER TABLE services
    ADD COLUMN entities text[] NOT NULL DEFAULT '{}',
    ADD COLUMN examples text[] NOT NULL DEFAULT '{}';