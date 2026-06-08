-- liquibase formatted sql
-- rollback

-- Remove the 'jump-to-service' value from the step_type enum
ALTER TYPE step_type DROP VALUE 'jump-to-service';
