INSERT INTO endpoints (
    endpoint_id,
    service_id,
    name,
    type,
    is_common,
    definitions,
    deleted,
    created_at,
    updated_at
)
SELECT
    endpoint_id,
    service_id,
    name,
    type,
    is_common,
    definitions,
    TRUE AS deleted,
    created_at, 
    updated_at
FROM endpoints
WHERE endpoint_id = :id::uuid
ORDER BY id DESC
LIMIT 1;
