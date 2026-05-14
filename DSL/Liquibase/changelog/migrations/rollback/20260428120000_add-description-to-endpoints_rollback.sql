-- liquibase formatted sql
-- rollback

ALTER TABLE endpoints
    DROP COLUMN description;
