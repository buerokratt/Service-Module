-- liquibase formatted sql
-- changeset ahmed:1678232509
CREATE TYPE ruuter_api_types AS ENUM (
 'GET',
 'POST'
);

ALTER TABLE services 
ADD COLUMN ruuter_type ruuter_api_types DEFAULT 'GET';
