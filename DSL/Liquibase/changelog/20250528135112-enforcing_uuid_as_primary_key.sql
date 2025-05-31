-- liquibase formatted sql
-- changeset Artsiom Beida:20250528135112 ignore:true

-- Modify services table
ALTER TABLE services ADD COLUMN uuid_id UUID DEFAULT gen_random_uuid();
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_pkey;

-- ALTER TABLE services ADD COLUMN created TIMESTAMP WITH TIME ZONE DEFAULT NOW();
--
-- UPDATE services
-- SET created = NOW() - make_interval(
--     secs => (SELECT MAX(id) FROM services) - id
-- );

ALTER TABLE services DROP COLUMN id;
ALTER TABLE services RENAME COLUMN uuid_id TO id;
ALTER TABLE services ADD PRIMARY KEY (id);


-- Modify service_settings table
ALTER TABLE services_settings ADD COLUMN uuid_id UUID DEFAULT gen_random_uuid();
ALTER TABLE services_settings DROP CONSTRAINT IF EXISTS services_settings_pkey;

ALTER TABLE services_settings ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

UPDATE services_settings
SET created_at = NOW() - make_interval(
    secs => (SELECT MAX(id) FROM services_settings) - id
);

ALTER TABLE services_settings DROP COLUMN id;
ALTER TABLE services_settings RENAME COLUMN uuid_id TO id;
ALTER TABLE services_settings ADD PRIMARY KEY (id);


-- Modify request_logs table
ALTER TABLE request_logs ADD COLUMN uuid_id UUID DEFAULT gen_random_uuid();
ALTER TABLE request_logs DROP CONSTRAINT IF EXISTS request_logs_pkey;

ALTER TABLE request_logs DROP COLUMN id;
ALTER TABLE request_logs RENAME COLUMN uuid_id TO id;
ALTER TABLE request_logs ADD PRIMARY KEY (id);