-- liquibase formatted sql
-- changeset baha-a:1683871183

ALTER TABLE request_logs 
ADD serviceId TEXT NOT NULL,
ADD elements TEXT NULL,
ADD environment TEXT NOT NULL;
