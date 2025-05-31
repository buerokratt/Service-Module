-- liquibase formatted sql
-- changeset ahmer-mt:20250601033822 ignore:true
UPDATE services.services
SET updated_at = updated_at + INTERVAL '1 millisecond'
WHERE deleted = true;
