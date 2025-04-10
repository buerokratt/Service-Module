INSERT INTO services (
    name,
    description,
    created_at,
    updated_at,
    ruuter_type,
    current_state,
    service_id,
    is_common,
    deleted,
    structure,
    endpoints,
    slot
)
SELECT
    name,
    description,
    NOW() as created_at,
    NOW() as updated_at,
    ruuter_type,
    current_state,
    service_id,
    is_common,
    deleted,
    structure,
    COALESCE(
        (
            SELECT jsonb_agg(endpoint)
            FROM jsonb_array_elements(endpoints::jsonb) endpoint
            WHERE endpoint->>'id' != :endpoint_id
        ),
        '[]'::jsonb
    ) as endpoints,
    slot
FROM services
WHERE service_id = :service_id
ORDER BY id DESC
LIMIT 1;
