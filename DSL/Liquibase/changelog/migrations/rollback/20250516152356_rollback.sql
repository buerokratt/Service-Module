ALTER TABLE endpoints
DROP COLUMN last_test_at,
DROP COLUMN verification_status,
DROP COLUMN last_status_code,
DROP COLUMN schema_captured;
