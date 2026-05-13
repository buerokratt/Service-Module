-- liquibase formatted sql

ALTER TABLE endpoints
    ADD COLUMN description TEXT NOT NULL DEFAULT '';
