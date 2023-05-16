-- liquibase formatted sql
-- changeset baha-a:1684228311
CREATE TABLE services_settings (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  value TEXT NOT NULL
);

INSERT INTO services_settings (id, name, value)
VALUES(100, 'maxInputTry', '4');
