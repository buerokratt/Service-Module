INSERT INTO endpoints (
    endpoint_id,
    service_ids,
    name,
    type,
    file_name,
    is_common,
    definitions,
    deleted,
    created_at,
    updated_at
)
SELECT
    endpoint_id,
    service_ids,
    name,
    type,
    file_name,
    is_common,
    definitions,
    TRUE AS deleted,
    created_at, 
    updated_at
FROM endpoints
WHERE endpoint_id = :id
ORDER BY id DESC
LIMIT 1;