-- liquibase formatted sql
-- changeset 1AhmedYasser:1748286839
CREATE TABLE user_step_preference (
    id BIGSERIAL PRIMARY KEY,
    user_id_code TEXT NOT NULL,
    step step_type NOT NULL,
    ordinality int NOT NULL DEFAULT 0,
    active boolean NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
