-- liquibase formatted sql
-- changeset baha-a:1715683083
ALTER TABLE services 
DROP CONSTRAINT IF EXISTS services_service_id_key;
