INSERT INTO services (
    name,
    description,
    slot,
    ruuter_type,
    current_state,
    service_id,
    is_common,
    structure
)
SELECT
    name,
    description,
    slot,
    ruuter_type,
    :new_state::service_state,
    service_id,
    is_common,
    structure
FROM services
WHERE service_id = :id
ORDER BY id DESC
LIMIT 1;
