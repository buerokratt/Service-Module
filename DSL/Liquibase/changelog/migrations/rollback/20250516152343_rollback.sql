-- liquibase formatted sql
-- rollback

-- Add back the file_name column as TEXT
ALTER TABLE endpoints ADD COLUMN file_name TEXT NOT NULL;
