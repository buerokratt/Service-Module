-- liquibase formatted sql
-- rollback

-- Remove the 'dynamic-choices' value from the step_type enum
ALTER TYPE step_type DROP VALUE 'dynamic-choices';
