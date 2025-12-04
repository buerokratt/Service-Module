-- Empty tables that were affected by the UPDATE/DELETE refactoring
-- This script is for test environments only to reset data after refactoring

-- Delete in order to respect logical dependencies (even though there are no FK constraints)
-- 1. User step preferences (references endpoints via UUID array)
DELETE FROM user_step_preference;

-- 2. Endpoints (references services via service_id UUID)
DELETE FROM endpoints;

-- 3. Services
DELETE FROM services;

-- 4. Service settings (independent)
DELETE FROM services_settings;

