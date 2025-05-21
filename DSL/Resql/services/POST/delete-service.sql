INSERT INTO services (
    name,
    description,
    slot,
    created_at,
    updated_at,
    ruuter_type,
    current_state,
    service_id,
    is_common,
    deleted,
    structure
)
SELECT
    name,
    description,
    slot,
    created_at,
    updated_at,
    ruuter_type,
    current_state,
    service_id,
    is_common,
    TRUE AS deleted,
    structure
FROM services
WHERE service_id =: id
ORDER BY id DESC
LIMIT 1;
