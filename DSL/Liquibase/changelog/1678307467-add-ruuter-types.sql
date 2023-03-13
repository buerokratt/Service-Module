-- liquibase formatted sql
-- changeset ahmedyasser:1678307467
ALTER TABLE services 
ADD COLUMN ruuter_type TEXT DEFAULT 'GET';
