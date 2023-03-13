-- liquibase formatted sql
-- changeset ahmedyasser:1678307467
CREATE TYPE ruuter_request_type AS ENUM ('GET', 'POST');

ALTER TABLE services 
ADD COLUMN ruuter_type ruuter_request_type DEFAULT 'GET';
