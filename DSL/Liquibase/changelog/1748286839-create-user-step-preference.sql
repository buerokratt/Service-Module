-- liquibase formatted sql
-- changeset 1AhmedYasser:1748286839
CREATE TABLE user_step_preference (
    id BIGSERIAL PRIMARY KEY,
    user_id_code TEXT NOT NULL,
    steps step_type[] NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
