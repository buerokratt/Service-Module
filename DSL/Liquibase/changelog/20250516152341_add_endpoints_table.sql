-- liquibase formatted sql
-- changeset IgorKrupenja:20250516152341 
CREATE TABLE endpoints (
    id SERIAL PRIMARY KEY,
    service_id INT NOT NULL,
    endpoint_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
