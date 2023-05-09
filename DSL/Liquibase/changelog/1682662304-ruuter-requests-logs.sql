-- liquibase formatted sql
-- changeset baha-a:1682662304
CREATE TABLE request_logs (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  level TEXT NOT NULL,
  statusCode INT NOT NULL DEFAULT 0,
  content TEXT NOT NULL
);
