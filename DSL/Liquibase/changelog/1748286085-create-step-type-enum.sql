-- liquibase formatted sql
-- changeset 1AhmedYasser:1748286085
CREATE TYPE step_type AS ENUM (
    'auth',
    'textfield',
    'input',
    'assign',
    'condition',
    'multi-choice-question',
    'open-webpage',
    'file-generate',
    'file-sign',
    'finishing-step-end',
    'finising-step-redirect',
    'rasa-rules',
    'siga'
);
