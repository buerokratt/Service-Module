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
