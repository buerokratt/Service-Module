-- liquibase formatted sql

-- changeset liquibase:1719301751746
CREATE TYPE ruuter_request_type AS ENUM ('GET', 'POST');

CREATE TYPE service_state AS ENUM ('active', 'inactive', 'draft', 'ready');

CREATE EXTENSION IF NOT EXISTS hstore;

CREATE TABLE "request_logs" ("id" BIGINT GENERATED BY DEFAULT AS IDENTITY NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL, "level" TEXT NOT NULL, "statuscode" INTEGER DEFAULT 0 NOT NULL, "content" TEXT NOT NULL, "serviceid" TEXT NOT NULL, "elements" TEXT, "environment" TEXT NOT NULL, CONSTRAINT "request_logs_pkey" PRIMARY KEY ("id"));

CREATE TABLE "services_settings" ("id" BIGINT GENERATED BY DEFAULT AS IDENTITY NOT NULL, "name" TEXT NOT NULL, "value" TEXT NOT NULL, CONSTRAINT "services_settings_pkey" PRIMARY KEY ("id"));

INSERT INTO "services_settings" ("id", "name", "value") VALUES (100, 'maxInputTry', '4');

CREATE TABLE "services" ("id" BIGINT GENERATED BY DEFAULT AS IDENTITY NOT NULL, "name" TEXT NOT NULL, "description" TEXT NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL, "ruuter_type" RUUTER_REQUEST_TYPE DEFAULT 'GET', "current_state" SERVICE_STATE DEFAULT 'draft', "service_id" TEXT NOT NULL, "is_common" BOOLEAN DEFAULT FALSE NOT NULL, "deleted" BOOLEAN DEFAULT FALSE NOT NULL, "structure" JSON DEFAULT '{}' NOT NULL, "endpoints" JSON DEFAULT '[]' NOT NULL, CONSTRAINT "services_pkey" PRIMARY KEY ("id"));

ALTER SEQUENCE services_settings_id_seq RESTART WITH 1000;
