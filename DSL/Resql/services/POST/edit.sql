INSERT INTO services (
    name,
    description,
    slot,
    examples,
    entities,
    ruuter_type,
    current_state,
    service_id,
    is_common,
    structure
)
SELECT
    :name AS name,
    :description as description,
    :slot AS slot,
    ARRAY[ :examples ]::text[] as examples,
    ARRAY[ :entities ]::text[] as entities,
    ruuter_type AS ruuter_type,
    :state::service_state,
    service_id AS service_id,
    COALESCE(:is_common, false) AS is_common,
    :structure::json AS structure
FROM services
WHERE service_id = :id
ORDER BY id DESC
LIMIT 1;
